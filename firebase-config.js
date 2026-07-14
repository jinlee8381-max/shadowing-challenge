// ===================================================
// 🔥 Firebase 설정 파일
// ===================================================
// [설정 방법 - 처음 한 번만 하면 됩니다]
//
// 1. https://console.firebase.google.com 에 접속 (구글 계정 필요)
// 2. "프로젝트 추가" → 이름 입력 (예: shadowing-challenge) → 만들기
// 3. 프로젝트 홈 화면 중앙 "</>" 웹 아이콘 클릭
// 4. 앱 닉네임 입력 후 "앱 등록" → firebaseConfig 값 복사
// 5. 아래 firebaseConfig 안의 값들을 복사한 것으로 교체
//
// [Firebase 기능 2가지 활성화]
// • Firestore: 왼쪽 메뉴 "빌드" → Firestore Database → 데이터베이스 만들기 → 테스트 모드 선택
// • Storage:   왼쪽 메뉴 "빌드" → Storage → 시작하기 → 테스트 모드 선택
// ===================================================

const firebaseConfig = {
  apiKey:            "AIzaSyDORhP6u_7alaVvkdy2AxnVYZQsLQDEBOU",
  authDomain:        "listeningclassapp.firebaseapp.com",
  projectId:         "listeningclassapp",
  storageBucket:     "listeningclassapp.firebasestorage.app",
  messagingSenderId: "413832094784",
  appId:             "1:413832094784:web:9048abe82d7243104a6ba5"
};

// Firebase 초기화
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db      = firebase.firestore();
const storage = firebase.storage();

// ===================================================
// ⚙️ 챌린지 설정 (매달 이 두 줄만 바꾸면 됩니다)
// ===================================================
let CHALLENGE_MONTH = '2026-07';     // 현재 챌린지 월
let CHALLENGE_START = '2026-07-06'; // 챌린지 첫 번째 월요일 날짜

// ===================================================
// 날짜 / 주차 계산 유틸리티
// ===================================================

// 현재 주차·요일 정보 반환
function getWeekInfo() {
  const s = new Date(CHALLENGE_START + 'T00:00:00');
  const t = new Date();
  t.setHours(0,0,0,0); s.setHours(0,0,0,0);
  const diff = Math.floor((t - s) / 86400000);
  if (diff < 0)  return { week:1, dayOfWeek:0, lessonDay:1 };
  if (diff >= 28) return { week:4, dayOfWeek:6, lessonDay:5 };
  const week      = Math.floor(diff/7) + 1;
  const dayOfWeek = diff % 7; // 0=월, 1=화, ..., 6=일
  return { week, dayOfWeek, lessonDay: Math.min(dayOfWeek+1, 5) };
}

// N주차의 날짜 배열 7개 (월~일) 반환 → 'YYYY-MM-DD' 형식
function getWeekDates(weekNum) {
  const s = new Date(CHALLENGE_START + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + (weekNum-1)*7 + i);
    return toLocalDateStr(d);
  });
}

// 날짜 → 'YYYY-MM-DD' (로컬 시간 기준, 한국 시간대 버그 방지)
function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 오늘 날짜 'YYYY-MM-DD' 형식
function todayStr() {
  return toLocalDateStr(new Date());
}

// Firestore Timestamp → 'M/D' 표시용
function tsToMD(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

// Firestore Timestamp → 'YYYY-MM-DD' 비교용
function tsToDateKey(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return toLocalDateStr(d);
}

// ===================================================
// Firestore / Storage 데이터 함수
// ===================================================

// 학생 목록 불러오기
async function loadStudentList() {
  try {
    const doc = await db.collection('challenges').doc(CHALLENGE_MONTH).get();
    return doc.exists ? (doc.data().students || []) : [];
  } catch(e) { console.error('loadStudentList:', e); return []; }
}

// 학생 목록 저장
async function saveStudentList(students) {
  await db.collection('challenges').doc(CHALLENGE_MONTH).set({
    month: CHALLENGE_MONTH, startDate: CHALLENGE_START, students,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// 커리큘럼 전체 불러오기
async function loadCurriculum() {
  try {
    const snap = await db.collection('curriculum')
      .where('challengeMonth', '==', CHALLENGE_MONTH).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => a.week !== b.week ? a.week - b.week : a.day - b.day);
  } catch(e) { console.error('loadCurriculum:', e); return []; }
}

// 커리큘럼 한 개 저장
async function saveLesson(week, day, title, notionUrl) {
  await db.collection('curriculum').doc(`${CHALLENGE_MONTH}_w${week}d${day}`).set({
    challengeMonth: CHALLENGE_MONTH, week, day, title,
    notionUrl: notionUrl || '',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// 특정 학생의 인증 기록 불러오기
async function loadSubmissions(studentName) {
  try {
    const snap = await db.collection('submissions')
      .where('challengeMonth', '==', CHALLENGE_MONTH)
      .where('studentName',    '==', studentName).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => (a.submittedAt?.toMillis?.() || 0) - (b.submittedAt?.toMillis?.() || 0));
  } catch(e) { console.error('loadSubmissions:', e); return []; }
}

// 전체 학생 인증 기록 불러오기 (관리자 대시보드용)
async function loadAllSubmissions() {
  try {
    const snap = await db.collection('submissions')
      .where('challengeMonth', '==', CHALLENGE_MONTH).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('loadAllSubmissions:', e); return []; }
}

// 인증 제출 저장
async function saveSubmission(studentName, week, day, fileUrls, feeling) {
  return db.collection('submissions').add({
    studentName, challengeMonth: CHALLENGE_MONTH,
    week, day,
    fileUrls:   fileUrls  || [],
    feeling:    feeling   || '',
    teacherFeedback: '',
    feedbackAt: null,
    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// 피드백 저장 (practiceLinks = [{label, url}, ...] 발음 처방 링크, 선택)
async function saveFeedback(submissionId, feedback, practiceLinks) {
  await db.collection('submissions').doc(submissionId).update({
    teacherFeedback: feedback,
    practiceLinks: Array.isArray(practiceLinks) ? practiceLinks : [],
    feedbackAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// 파일을 Firebase Storage에 업로드하고 다운로드 URL 반환
async function uploadFiles(files, studentName) {
  const urls = [];
  for (const f of files) {
    const path = `submissions/${CHALLENGE_MONTH}/${studentName}/${Date.now()}_${f.name}`;
    const ref  = storage.ref(path);
    await ref.put(f);
    urls.push(await ref.getDownloadURL());
  }
  return urls;
}

// 서비스 워커 등록 (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
