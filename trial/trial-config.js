// ===================================================
// 🎁 5일 체험판 설정 파일
// ===================================================
// 본 챌린지(../firebase-config.js)와 같은 Firebase 프로젝트를 쓰지만
// 데이터는 완전히 분리되어 있습니다.
//   본 챌린지 : challenges / submissions / curriculum
//   체험판    : trialUsers / trialSubmissions / trialCurriculum
// → 서로 절대 섞이지 않아요.
// ===================================================

const firebaseConfig = {
  apiKey:            "AIzaSyDORhP6u_7alaVvkdy2AxnVYZQsLQDEBOU",
  authDomain:        "listeningclassapp.firebaseapp.com",
  projectId:         "listeningclassapp",
  storageBucket:     "listeningclassapp.firebasestorage.app",
  messagingSenderId: "413832094784",
  appId:             "1:413832094784:web:9048abe82d7243104a6ba5"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db      = firebase.firestore();
const storage = firebase.storage();

// ===================================================
// ⚙️ 체험판 기본 설정
// ===================================================

const TRIAL_DAYS = 5;                    // 체험 기간 (일) — 과제 개수와 반드시 같아야 함

// 체험판 주소 — 이메일에 넣을 링크를 만들 때 사용
const TRIAL_BASE_URL = 'https://jinlee8381-max.github.io/shadowing-challenge/trial/';

// 본 챌린지 신청서 주소 (모든 페이지 하단 CTA 버튼이 여기로 감)
const FULL_APPLY_URL = 'https://jinlee8381-max.github.io/shadowing-challenge/apply.html#apply';

// ===================================================
// ✉️ EmailJS 설정
// ===================================================
// service_id / user_id 는 본 신청서(apply.html)에서 쓰던 값 그대로입니다.
//
// welcomeTemplateId = 체험 신청자에게 나가는 환영 메일 (2026-07-31 연결 완료)
//   템플릿 원본: trial/_emailjs-welcome-template.html
//   쓰는 변수: {{to_email}} {{to_name}} {{trial_link}} {{start_date}} {{end_date}} {{trial_days}}
const EMAILJS = {
  serviceId:         'service_2428u4f',
  userId:            'nqLPvWJexb3PLr_uc',
  welcomeTemplateId: 'template_7fesa8n',
  adminTemplateId:   'template_q7j2iii'         // 신청 들어오면 선생님께 알림 (기존 템플릿 재사용)
};

// ===================================================
// 📚 체험 5일 커리큘럼 (기본값)
// ===================================================
// 자료 = 지난 챌린지 W1 「슈퍼볼 광고 · 알렉사 편」(스칼렛 요한슨 & 콜린 조스트)
//   Day 1~4 = 광고를 네 구간으로 나눠서 / Day 5 = 전체 통으로
// 관리자 페이지(admin.html)에서 수정하면 Firestore에 저장되고
// 아래 기본값보다 우선 적용됩니다. 여기 직접 고쳐도 됩니다.
const DEFAULT_TRIAL_LESSONS = [
  { day: 1,
    title:   '알렉사, 게임 데이',
    mission: '',
    notionUrl: 'https://app.notion.com/p/W1-D1-_-_-_-3ae6a9fdb6dd8013a531e519178badc7?source=copy_link' },

  { day: 2,
    title:   '알렉사의 엉뚱한 오해',
    mission: '무심한 대화 톤과 로봇 톤을 번갈아 연기해보세요',
    notionUrl: 'https://app.notion.com/p/W1-D2-_-_-_-3ae6a9fdb6dd80b2b712c64f3bac64d0?source=copy_link' },

  { day: 3,
    title:   'Tell Me Lies · 티키타카',
    mission: '주고받는 대화의 리듬과 감정선을 살리는 날',
    notionUrl: 'https://app.notion.com/p/W1-D3-_-_-_-3ae6a9fdb6dd8091b1dbd95053f071c6?source=copy_link' },

  { day: 4,
    title:   'Announcement · AI 톤 대결',
    mission: '알렉사의 무표정 낭독톤 vs 진짜 사람의 대화 톤',
    notionUrl: 'https://app.notion.com/p/W1-D4-_-_-_-3ae6a9fdb6dd80b9b2e8e854784e9568?source=copy_link' },

  { day: 5,
    title:   '마지막 날 · 전체 통으로',
    mission: '대본 없이 처음부터 끝까지 한 번에! 5일간 쪼갠 대사를 하나로 합쳐보세요',
    notionUrl: 'https://app.notion.com/p/W1-D5-_-_-_-3ae6a9fdb6dd805d837ae9547df319af?source=copy_link' }
];

// ===================================================
// 🎯 자가 체크 항목 (인증할 때 "오늘 어려웠던 소리" 선택)
// ===================================================
// url = 체험자에게 자동 추천할 발음 클리닉 페이지
// 순서 = 이번 체험 자료(슈퍼볼 알렉사 광고)에서 실제로 걸리는 소리 순
const SELF_CHECK_ITEMS = [
  { key: 'th',      label: 'th 소리',     ex: 'mouthwash',      url: '../practice/th.html' },
  { key: 'f',       label: 'F 소리',      ex: 'football',       url: '../practice/f.html' },
  { key: 'lr',      label: 'R · L 구분',  ex: 'blender · rosé', url: '../practice/lr.html' },
  { key: 'pbv',     label: 'P · B · V',   ex: 'Prime Video',    url: '../practice/pbv.html' },
  { key: 'z',       label: 'Z 소리',      ex: 'love scenes',    url: '../practice/z.html' },
  { key: 'ch-j',    label: 'ch · j 소리', ex: 'chilling',       url: '../practice/ch-j.html' },
  { key: 'sh',      label: 'sh 소리',     ex: 'she · fresh',    url: '../practice/sh.html' },
  { key: 'ae-e',    label: '애 vs 에',    ex: 'tan · bed',      url: '../practice/ae-e.html' },
  { key: 'ee',      label: '이 소리',     ex: 'streaming · in', url: '../practice/ee.html' },
  { key: 'oo',      label: '우 소리',     ex: 'foods · book',   url: '../practice/oo.html' },
  { key: 'uh',      label: '어 소리',     ex: 'love · worst',   url: '../practice/uh.html' }
];

// ===================================================
// 날짜 유틸
// ===================================================

function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todayStr() {
  return toLocalDateStr(new Date());
}

function tsToMD(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

function tsToDateKey(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return toLocalDateStr(d);
}

// 시작일 + N일 → 'YYYY-MM-DD'
function dateAfter(startDate, n) {
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toLocalDateStr(d);
}

// 체험 기간 날짜 배열
function trialDates(startDate) {
  return Array.from({ length: TRIAL_DAYS }, (_, i) => dateAfter(startDate, i));
}

// 오늘이 체험 며칠째인지 계산 (Day 1 ~ 7)
function trialDayInfo(startDate) {
  const s = new Date(startDate + 'T00:00:00');
  const t = new Date(); t.setHours(0,0,0,0);
  const diff = Math.floor((t - s) / 86400000);
  const day  = diff + 1;
  return {
    day:      Math.min(Math.max(day, 1), TRIAL_DAYS),
    rawDay:   day,
    ended:    day > TRIAL_DAYS,
    lastDate: dateAfter(startDate, TRIAL_DAYS - 1)
  };
}

// ===================================================
// 이메일 = 체험자 고유 키
// ===================================================

function normEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail(email));
}

// 이메일 → Firestore 문서 ID (슬래시만 안전하게 치환)
function emailKey(email) {
  return normEmail(email).replace(/\//g, '_');
}

// ===================================================
// 체험자 (trialUsers)
// ===================================================

async function loadTrialUser(email) {
  try {
    const doc = await db.collection('trialUsers').doc(emailKey(email)).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch(e) { console.error('loadTrialUser:', e); return null; }
}

// 체험자 등록 (이미 있으면 기존 정보 그대로 반환 — 시작일 리셋 방지)
async function createTrialUser({ name, email, source, struggle }) {
  const key      = emailKey(email);
  const existing = await loadTrialUser(email);
  if (existing) return { ...existing, alreadyExisted: true };

  const user = {
    name:           String(name || '').trim(),
    email:          normEmail(email),
    startDate:      todayStr(),
    source:         source || 'apply',
    struggle:       struggle || '',
    appliedFull:    false,
    privacyConsent: true,
    createdAt:      firebase.firestore.FieldValue.serverTimestamp()
  };
  await db.collection('trialUsers').doc(key).set(user);
  return { id: key, ...user };
}

// 'YYYY-MM-DD' → '8월 1일 (금)' 처럼 읽기 쉬운 형태로
function prettyDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = ['일','월','화','수','목','금','토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dow})`;
}

// 체험 링크 이메일 발송 (EmailJS)
// startDate 를 넘기면 메일 템플릿에서 {{start_date}} / {{end_date}} 를 쓸 수 있음
async function sendTrialLinkEmail({ name, email, startDate }) {
  const link  = `${TRIAL_BASE_URL}?e=${encodeURIComponent(normEmail(email))}`;
  const start = startDate || todayStr();
  const end   = dateAfter(start, TRIAL_DAYS - 1);

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  EMAILJS.serviceId,
      template_id: EMAILJS.welcomeTemplateId,
      user_id:     EMAILJS.userId,
      template_params: {
        to_email:   normEmail(email),
        to_name:    name || '',
        trial_link: link,
        start_date: prettyDate(start),
        end_date:   prettyDate(end),
        trial_days: String(TRIAL_DAYS)
      }
    })
  });
  if (!res.ok) throw new Error(await res.text());
  return link;
}

// 전체 체험자 목록 (관리자용)
async function loadAllTrialUsers() {
  try {
    const snap = await db.collection('trialUsers').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('loadAllTrialUsers:', e); return []; }
}

// ===================================================
// 체험 인증 (trialSubmissions)
// ===================================================

async function loadTrialSubmissions(email) {
  try {
    const snap = await db.collection('trialSubmissions')
      .where('email', '==', normEmail(email)).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => (a.submittedAt?.toMillis?.() || 0) - (b.submittedAt?.toMillis?.() || 0));
  } catch(e) { console.error('loadTrialSubmissions:', e); return []; }
}

async function loadAllTrialSubmissions() {
  try {
    const snap = await db.collection('trialSubmissions').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.error('loadAllTrialSubmissions:', e); return []; }
}

async function saveTrialSubmission({ email, name, day, fileUrls, feeling, selfCheck }) {
  return db.collection('trialSubmissions').add({
    email:       normEmail(email),
    name:        name || '',
    day:         day,
    dateKey:     todayStr(),
    fileUrls:    fileUrls  || [],
    feeling:     feeling   || '',
    selfCheck:   selfCheck || [],
    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function uploadTrialFiles(files, email) {
  const urls = [];
  for (const f of files) {
    const path = `trial/${emailKey(email)}/${Date.now()}_${f.name}`;
    const ref  = storage.ref(path);
    await ref.put(f);
    urls.push(await ref.getDownloadURL());
  }
  return urls;
}

// ===================================================
// 체험 커리큘럼 (trialCurriculum) — 기본값 + 관리자 수정분
// ===================================================

async function loadTrialCurriculum() {
  const lessons = DEFAULT_TRIAL_LESSONS.map(l => ({ ...l }));
  try {
    const snap = await db.collection('trialCurriculum').get();
    snap.docs.forEach(d => {
      const data = d.data();
      const idx  = lessons.findIndex(l => l.day === data.day);
      if (idx >= 0) Object.assign(lessons[idx], {
        title:     data.title     ?? lessons[idx].title,
        mission:   data.mission   ?? lessons[idx].mission,
        notionUrl: data.notionUrl ?? lessons[idx].notionUrl
      });
    });
  } catch(e) { console.error('loadTrialCurriculum:', e); }
  return lessons.sort((a,b) => a.day - b.day);
}

async function saveTrialLesson(day, { title, mission, notionUrl }) {
  await db.collection('trialCurriculum').doc(`day${day}`).set({
    day, title, mission,
    notionUrl: notionUrl || '',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===================================================
// 연속 인증 계산
// ===================================================

function calcTrialStreak(subs) {
  const dates = [...new Set(subs.map(s => s.dateKey || tsToDateKey(s.submittedAt)).filter(Boolean))].sort();
  if (dates.length === 0) return { streak: 0, best: 0 };

  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((new Date(dates[i]) - new Date(dates[i-1])) / 86400000);
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else cur = 1;
  }
  const last  = new Date(dates[dates.length - 1]);
  const today = new Date(); today.setHours(0,0,0,0);
  const gap   = Math.round((today - last) / 86400000);
  return { streak: gap <= 1 ? cur : 0, best };
}

// ===================================================
// 자동 응원 메시지 (선생님 피드백 대신)
// ===================================================

function encourageMessage(day, doneCount, streak) {
  if (doneCount === 0) {
    return { emoji: '🌱', title: '오늘이 시작하기 딱 좋은 날이에요',
             body: '완벽하게 하려고 하지 마세요. 30초만 따라 말해도 오늘 인증이에요.' };
  }
  if (doneCount >= TRIAL_DAYS) {
    return { emoji: '🏆', title: `${TRIAL_DAYS}일 전부 완주했어요!`,
             body: '이건 진짜 대단한 거예요. 대부분 3일을 못 넘겨요. 이 습관, 여기서 끊기면 아까워요.' };
  }
  if (streak >= 4) {
    return { emoji: '🔥', title: `${streak}일 연속! 하루만 더 하면 완주예요`,
             body: '이 정도 오면 소리가 들리기 시작하는 구간이에요. 끝까지 가봐요!' };
  }
  if (streak >= 3) {
    return { emoji: '💪', title: `${streak}일 연속 중이에요`,
             body: '대부분 3일째에 그만둬요. 지금 그 고비를 넘고 있는 중이에요!' };
  }
  if (day >= 4 && doneCount <= 1) {
    return { emoji: '🌤️', title: '며칠 빠져도 괜찮아요',
             body: '체험은 완벽하게 하는 게 목적이 아니에요. 오늘 한 번이면 충분해요.' };
  }
  return { emoji: '👏', title: `${doneCount}일 인증했어요`,
           body: '어제보다 입이 조금 더 편해졌을 거예요. 오늘도 30초만!' };
}

// ===================================================
// 로그인 상태 (localStorage)
// ===================================================

const TRIAL_EMAIL_KEY = 'trial_my_email';

function saveMyTrialEmail(email) { localStorage.setItem(TRIAL_EMAIL_KEY, normEmail(email)); }
function getMyTrialEmail()       { return localStorage.getItem(TRIAL_EMAIL_KEY) || ''; }
function clearMyTrialEmail()     { localStorage.removeItem(TRIAL_EMAIL_KEY); }

// URL의 ?e= 파라미터 → localStorage 순으로 이메일 찾기
function resolveTrialEmail() {
  const urlEmail = new URLSearchParams(location.search).get('e');
  if (urlEmail && isValidEmail(urlEmail)) {
    saveMyTrialEmail(urlEmail);
    return normEmail(urlEmail);
  }
  return getMyTrialEmail();
}
