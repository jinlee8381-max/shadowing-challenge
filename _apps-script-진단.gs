/**
 * LJ ENGLISH 쉐도잉 진단 — 시트 기록 + 결과 메일 발송
 * (북클럽 리딩 진단 apps-script-전체.gs 와 같은 구조)
 *
 * ═══════════════════════════════════════════════════════════
 * 설치
 *   1) 새 구글 스프레드시트를 만드세요 (예: 「쉐도잉 진단 결과」)
 *      ⚠️ 체험 리마인드 메일이 쓰는 「쉐도잉 챌린지 체험 관리」와 반드시 별개로!
 *         Apps Script 는 프로젝트당 doGet 이 하나뿐이라 같이 두면 충돌합니다.
 *   2) 확장 프로그램 → Apps Script → 이 파일 내용을 통째로 붙여넣기
 *   3) 함수 목록에서 sendTestMail 을 골라 ▶ 실행 → 권한 승인 → 본인에게 견본 메일 도착
 *   4) 배포 → 새 배포 → 유형 「웹 앱」
 *        실행 사용자 = 나
 *        액세스 권한 = 모든 사용자          ← 이거 안 하면 방문자 요청이 막힙니다
 *   5) 나오는 /exec 주소를 diagnosis.html 의 SHEET_MIRROR_URL 에 붙여넣기
 *
 * 고친 뒤에는
 *   배포 → 배포 관리 → 수정(연필) → 버전 「새 버전」 → 배포
 *   ('새 배포'로 만들면 주소가 바뀌어서 diagnosis.html 도 같이 고쳐야 합니다)
 *
 * 시트 2장이 자동으로 생깁니다
 *   진단결과    — 진단을 끝낸 모든 사람 (이메일 안 남겨도 기록됨)
 *   결과메일신청 — 이메일을 남긴 사람 = 리드 명단
 * ═══════════════════════════════════════════════════════════
 */

// 메일 안의 버튼이 갈 곳 — 5일 무료 체험 신청서
const TRIAL_URL = 'https://jinlee8381-max.github.io/shadowing-challenge/trial/apply.html';

// 무료 소리법칙 자료
const BASE = 'https://jinlee8381-max.github.io/shadowing-challenge/';

// 문의 창구 — 메일 답장 대신 카톡으로 받습니다.
// (MailApp 은 스크립트를 실행한 구글 계정으로 답장이 가버려서, 답장은 안내하지 않습니다)
const KAKAO_URL = 'https://open.kakao.com/o/skMgtU2f';
// 유형 맞춤 훈련 PDF (리스닝 부스터 다운로드 페이지, 비밀번호 ljenglish) — 2026-10-29
const BOOSTER = { url: 'https://lj-boosters.jinlee8381.workers.dev/free.html', password: 'ljenglish' };

// 배포된 버전 확인용 (코드를 고칠 때마다 숫자를 올리세요)
const VERSION = 'v3';   // v3 (2026-10-29): 유형 맞춤 훈련 PDF(리스닝 부스터) 블록 추가

/* ═══════════════════════════════════════════
   유형별 메일 내용

   ⚠️ diagnosis.html 의 RESULTS 와 별개입니다 (일부러 그렇게 했습니다).
      전체 문구를 주소로 넘기면 2,600자까지 길어져서, 유형 키만 넘기고
      메일 본문은 여기서 만듭니다. 페이지 문구를 크게 바꾸면 여기도 같이 손보세요.
═══════════════════════════════════════════ */
const TYPES = {
  sound: {
    label: '축약 · 연음형',
    pdf: '소리법칙 퀵 트레이닝북 (축약 · 연음 · 약화 미니 훈련)',
    title: '안 들리는 게 아니라, 소리가 붙어서 다른 단어가 된 것입니다',
    desc: '글자로 배운 영어와 실제 소리 사이에는 규칙이 하나 더 있어요. 소리가 서로 붙고, 바뀌고, 사라지는 규칙입니다. 재능이 아니라 규칙이라서, 한 번 정리하면 같은 영상이 다르게 들리는 경험을 생각보다 빨리 하게 됩니다.',
    material: { name: '축약 · 연음 자료', url: BASE + 'practice/contractions.html' },
    steps: [
      '소리가 왜 붙고 사라지는지 규칙부터 이해하기',
      '그 규칙이 들어간 실제 문장으로 옮겨가기',
      '내가 뭉갠 소리를 1:1로 교정받기',
      '끝까지 안 되는 소리는 발음 클리닉으로 따로 잡기'
    ],
    weeks: [
      '하루 10분 · 문장 2개, 붙는 소리에 표시하고 5번씩',
      '하루 10분 · 문장 3개, 원어민 소리와 번갈아 듣기',
      '하루 10분 · 같은 문장을 원래 속도로 5번',
      '하루 10분 · 대본 없이 듣고 빈칸 채워보기'
    ]
  },

  reduce: {
    label: '음절 축약형',
    pdf: '소리법칙 퀵 트레이닝북 (약해지는 단어 미니 훈련)',
    title: '들리는 단어만 들리고, 약해진 단어가 통째로 사라지고 있습니다',
    desc: 'and, of, to, for, can, have 처럼 짧은 단어들은 원어민이 거의 소리 내지 않고 흘려버립니다. 하필 이 단어들이 문장을 이어주는 접착제여서, 안 들리면 단어들이 조각조각 떨어집니다. 줄어든 소리가 어떻게 들리는지 미리 알아둬야 복원이 됩니다.',
    material: { name: '강세 없는 음절의 축약 자료', url: BASE + 'practice/reduced-syllables.html' },
    steps: [
      '어떤 단어가 약해지는지 패턴부터 익히기',
      '사라진 소리를 복원해서 듣는 연습으로 넘어가기',
      '놓친 구간을 1:1로 확인받기',
      '문장을 끊지 않고 흐름째로 듣기'
    ],
    weeks: [
      '하루 10분 · 문장 2개, 안 들린 단어에 동그라미',
      '하루 10분 · 그 단어만 3번 듣고 소리 내어 말하기',
      '하루 10분 · 문장을 끊지 않고 3번 이어 듣기',
      '하루 10분 · 대본 없이 듣고 받아쓰기'
    ]
  },

  rhythm: {
    label: '억양 · 강세형',
    pdf: '리스닝 귀 뚫기 체크리스트 (내 1번 원인 찾기 + 7일 처방)',
    title: '듣는 귀는 열렸는데, 입이 리듬을 모르고 있습니다',
    desc: '어느 정도 알아듣는다는 건 소리 규칙이 이미 반쯤 잡혀 있다는 뜻이에요. 영어는 중요한 단어만 길고 세게, 나머지는 짧고 약하게 흘립니다. 이 강약의 파도는 눈으로 배울 수 없어서, 소리 내어 따라 하고 어디가 어긋났는지 짚어줄 사람이 있어야 고쳐집니다.',
    material: { name: '억양에 따른 의미 차이 자료', url: BASE + 'practice/intonation-stress.html' },
    steps: [
      '문장에서 힘이 들어가는 자리를 눈에 익히기',
      '들리는 대로가 아니라 강약을 살려 말해보기',
      '어긋난 강세를 1:1로 교정받기',
      '반복해서 지적되는 소리는 발음 클리닉으로'
    ],
    weeks: [
      '하루 10분 · 문장 2개, 힘 주는 단어에 표시하고 5번씩',
      '하루 10분 · 한 문장 녹음해서 원어민 소리와 비교',
      '하루 10분 · 감정 넣어 3번 말하고 다시 녹음',
      '하루 10분 · 대본 없이 리듬만으로 따라 말하기'
    ]
  },

  routine: {
    label: '루틴형',
    pdf: '리스닝 귀 뚫기 체크리스트 (7일 × 10분 처방으로 루틴 만들기)',
    title: '방법이 문제가 아니라, 혼자 버티는 구조가 문제입니다',
    desc: '쉐도잉이 좋다는 것도 이미 알고 계실 거예요. 그런데 3일을 못 넘깁니다. 혼자 할 때는 오늘 뭘 할지 정하는 것부터가 일이고, 빼먹어도 아무도 모르니까요. 필요한 건 새로운 공부법이 아니라 안 하면 이상해지는 구조입니다.',
    material: { name: '축약 · 연음 자료', url: BASE + 'practice/contractions.html' },
    steps: [
      '고민할 것 없이 오늘 할 것 하나만 받기',
      '한 번 하면 기록이 남는 구조에 올라타기',
      '혼자가 아니라 같이 하는 사람들과 함께',
      '매일 봐주는 선생님이 있다는 것'
    ],
    weeks: [
      '하루 10분 · 문장 1개만, 빠지지 않는 게 목표',
      '하루 10분 · 문장 2개, 연속 기록 이어가기',
      '하루 10분 · 문장 3개로 늘리기',
      '하루 10분 · 한 주 분량 통째로 복습'
    ]
  }
};

/* ═══════════════════════════════════════════
   요청 처리
═══════════════════════════════════════════ */
function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  try {
    if (p.action === 'version')  return out_(VERSION + ' | CTA=' + TRIAL_URL);
    if (p.action === 'sendmail') return sendMail_(p);
    if (p.action === 'leveltest') return saveLevelTest_(p);
    if (!p.type) return out_('연결 성공!');
    saveRow_(p);
    return out_('OK');
  } catch (err) {
    return out_('Error: ' + err.message);
  }
}

function doPost(e) { return doGet(e); }

function out_(t) {
  return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT);
}

function sheet_(name, heads) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(heads);
    sh.getRange(1, 1, 1, heads.length)
      .setFontWeight('bold').setBackground('#F2E4E9').setFontColor('#7A4A5A');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150);
  }
  return sh;
}

/* ───────── 진단 결과 한 줄 저장 (이메일 안 남긴 사람 포함) ───────── */

const COLS  = ['submittedAt', 'type', 'typeLabel', 'answers', 'ctaMode', 'source', 'triedTrial'];
const HEADS = ['제출시간', '유형키', '유형', '문항별 응답', 'CTA 모드', '유입 경로', '체험 이력'];

function saveRow_(p) {
  sheet_('진단결과', HEADS)
    .appendRow(COLS.map(function (k) { return p[k] === undefined ? '' : p[k]; }));
}

/* ───────── 리스닝 레벨테스트(listening-test.html) 결과 → 「레벨테스트」 탭 ───────── */

function saveLevelTest_(p) {
  sheet_('레벨테스트', ['제출시간', '이름', '이메일', '점수', '레벨', '가장 약한 소리', '유형별 정답', '틀린 문항', '유입 경로'])
    .appendRow([new Date(), p.name || '', p.email || '', "'" + (p.score || ''), p.level || '', p.weak || '', p.byType || '', p.wrong || '', p.source || '']);
  return out_('OK');
}

/* ───────── 결과 메일 발송 ───────── */

/** ▶ 설치 후 처음 한 번 이 함수를 실행하세요 (권한 승인 + 견본 메일) */
function sendTestMail() {
  const me = Session.getActiveUser().getEmail();
  sendMail_({ email: me, name: '테스트', type: 'sound', source: 'test' });
  Logger.log('견본 메일을 ' + me + ' 로 보냈습니다.');
}

/* ───────── 후속 메일 (2026-10-29) ─────────
   「결과메일신청」 탭의 사람에게: 다음 날 = 내 유형 팁 1개 · 3일 뒤 = 쉐도잉 5일 체험 초대. 한 사람 최대 2통, 보낸 기록은 F열.
   ▶ 처음 한 번 「설치_후속메일트리거」 실행 (매일 오전 9시) */
const FOLLOW = {
  sound:   { tip: 'want to → "워너", going to → "고너"처럼 자주 붙는 묶음 5개만 오늘 소리 내서 말해 보세요. 들리는 건 내가 말할 수 있는 소리예요.' },
  reduce:  { tip: 'and · of · to · for 는 원어민이 "은 · 어 · 터 · 퍼"처럼 아주 짧게 말해요. 오늘 들은 문장에서 이 단어들에만 동그라미를 쳐 보세요.' },
  rhythm:  { tip: '문장에서 제일 중요한 단어 하나만 길고 세게, 나머지는 빠르게. 오늘 한 문장을 녹음해서 원어민 소리와 강약만 비교해 보세요.' },
  routine: { tip: '오늘은 딱 문장 하나만 하세요. 목표는 잘하기가 아니라 "빠지지 않기"예요. 내일도 같은 시간에 한 문장.' }
};
function 설치_후속메일트리거() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'sendFollowups'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendFollowups').timeBased().atHour(9).everyDays(1).inTimezone('Asia/Seoul').create();
  Logger.log('매일 오전 9시 후속 메일 트리거를 만들었어요.');
}
function sendFollowups() {
  const sh = sheet_('결과메일신청', ['신청시간', '이름', '이메일', '유형', '유입 경로', '후속 발송']);
  const rows = sh.getDataRange().getValues(), now = new Date();
  const keyOf = function (label) { for (var k in TYPES) if (TYPES[k].label === label) return k; return 'routine'; };
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i], at = r[0] instanceof Date ? r[0] : new Date(r[0]), email = r[2], sent = String(r[5] || '');
    if (!email || !(at instanceof Date) || isNaN(at)) continue;
    const days = Math.floor((now - at) / 864e5), name = r[1] || '', k = keyOf(r[3]), t = TYPES[k];
    var job = null;
    if (days >= 1 && sent.indexOf('tip') < 0) job = 'tip';
    else if (days >= 3 && sent.indexOf('trial') < 0) job = 'trial';
    if (!job) continue;
    const hi = name ? name + '님, ' : '';
    const html = job === 'tip'
      ? '<div style="font-family:sans-serif;max-width:520px;margin:auto;line-height:1.8;color:#3A2A24">' + hi + '어제 진단해 주셔서 고마워요 😊<br><br>' +
        '<b>' + t.label + '</b>에게 딱 맞는 오늘의 10분 팁 하나 보내 드려요.<br><br>' +
        '<div style="background:#FDF6F8;border-radius:12px;padding:14px 16px">' + FOLLOW[k].tip + '</div><br>' +
        '어제 받으신 맞춤 PDF도 같이 펴 두시면 좋아요.<br><a href="' + BOOSTER.url + '">PDF 다시 받기</a> (비밀번호 ' + BOOSTER.password + ')<br><br>' +
        '내일도 응원할게요.<br>LJ쌤 드림<br><br><span style="font-size:12px;color:#999">LJ ENGLISH · 음성학 전문 성인 회화 강사 LJ쌤</span></div>'
      : '<div style="font-family:sans-serif;max-width:520px;margin:auto;line-height:1.8;color:#3A2A24">' + hi + '진단 받으신 지 사흘 됐네요.<br><br>' +
        '혼자 해 보니 어떠셨어요? 사실 <b>' + t.label + '</b>은 "맞게 하고 있는지"를 알려 주는 사람이 있을 때 제일 빨리 좋아져요.<br><br>' +
        '그래서 초대장을 하나 드려요. 내 목소리로 두 번 녹음하면, 어디가 달라졌는지 LJ쌤 기준으로 피드백을 받는 <b>쉐도잉 체험</b>이에요.<br><br>' +
        '<a href="' + TRIAL_URL + '?from=diag-mail" style="display:inline-block;background:#9A6070;color:#fff;text-decoration:none;font-weight:700;border-radius:11px;padding:12px 22px">쉐도잉 체험 시작하기</a><br><br>' +
        '부담 없이, 5분이면 시작할 수 있어요.<br>LJ쌤 드림<br><br><span style="font-size:12px;color:#999">LJ ENGLISH · 음성학 전문 성인 회화 강사 LJ쌤</span></div>';
    try {
      MailApp.sendEmail({ to: email, subject: job === 'tip' ? hi + t.label + ' 맞춤 10분 팁 하나 보내요' : hi + '내 목소리로 확인해 볼 차례예요', htmlBody: html, name: 'LJ ENGLISH' });
      sh.getRange(i + 1, 6).setValue((sent ? sent + ',' : '') + job);
    } catch (e) { Logger.log('후속 메일 실패 ' + email + ' ' + e); }
  }
}

function sendMail_(d) {
  if (!d.email) return out_('MAIL_ERR: 이메일 주소가 없습니다.');

  const t = TYPES[d.type];
  if (!t) return out_('MAIL_ERR: 알 수 없는 유형 ' + d.type);

  const name = d.name || '';

  MailApp.sendEmail({
    to: d.email,
    subject: (name ? name + '님, ' : '') + '리스닝 진단 결과가 나왔어요 · ' + t.label,
    htmlBody: body_(t, name),
    name: 'LJ ENGLISH'
  });

  sheet_('결과메일신청', ['신청시간', '이름', '이메일', '유형', '유입 경로'])
    .appendRow([new Date(), name, d.email, t.label, d.source || '']);

  return out_('MAIL_OK');
}

/* ───────── 메일 본문 ───────── */

function body_(t, name) {
  const steps = t.steps.map(function (s, i) {
    return '<tr><td style="padding:5px 0;font-size:14px;color:#3A2A24;line-height:1.65;">' +
           '<b style="color:#9A6070;">' + (i + 1) + '.</b> ' + s + '</td></tr>';
  }).join('');

  const weeks = t.weeks.map(function (w, i) {
    return '<tr><td style="padding:10px 13px;background:#FDF6F8;border-radius:9px;' +
           'font-size:13px;color:#7A6054;line-height:1.6;">' +
           '<b style="color:#9A6070;">' + (i + 1) + '주차</b> &nbsp; ' + w + '</td></tr>' +
           '<tr><td style="height:6px;"></td></tr>';
  }).join('');

  return '' +
  '<div style="margin:0;padding:0;background:#FAF8F5;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:28px 12px;">' +
  '<tr><td align="center">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,\'Apple SD Gothic Neo\',\'Noto Sans KR\',sans-serif;">' +

    // 헤더
    '<tr><td style="padding:30px 26px 22px;background:#F2E4E9;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#9A6070;">LJ CLASS</div>' +
      '<div style="font-size:19px;font-weight:800;color:#3A2A24;line-height:1.45;margin-top:10px;">' +
        (name ? name + '님의' : '') + ' 리스닝 진단 결과예요' +
      '</div>' +
    '</td></tr>' +

    // 유형
    '<tr><td style="padding:26px 26px 0;">' +
      '<div style="display:inline-block;font-size:12px;font-weight:700;color:#9A6070;background:#F2E4E9;padding:5px 14px;border-radius:100px;">' + t.label + '</div>' +
      '<div style="font-size:17px;font-weight:800;color:#3A2A24;line-height:1.5;margin-top:14px;">' + t.title + '</div>' +
      '<div style="font-size:14px;color:#7A6054;line-height:1.85;margin-top:12px;">' + t.desc + '</div>' +
    '</td></tr>' +

    // 무료 자료
    '<tr><td style="padding:24px 26px 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF6F8;border:1px solid #C49AAA;border-radius:14px;">' +
      '<tr><td style="padding:18px;">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#9A6070;">먼저 확인해보세요 · 무료</div>' +
        '<div style="font-size:15px;font-weight:800;color:#3A2A24;margin-top:8px;">' + t.material.name + '</div>' +
        '<div style="font-size:13px;color:#7A6054;line-height:1.75;margin-top:7px;">음원이 붙어 있어요. 5분만 들어보시면 왜 안 들렸는지 바로 아실 거예요.</div>' +
        '<a href="' + t.material.url + '" style="display:inline-block;margin-top:13px;font-size:14px;font-weight:700;color:#7A4A5A;text-decoration:none;border:1.5px solid #C49AAA;border-radius:11px;padding:11px 20px;">🎧 자료 들으러 가기</a>' +
      '</td></tr></table>' +
    '</td></tr>' +

    // 유형 맞춤 훈련 PDF (2026-10-29)
    '<tr><td style="padding:14px 26px 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1.5px solid #C49AAA;border-radius:14px;">' +
      '<tr><td style="padding:18px;">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#9A6070;">내 유형 맞춤 훈련법 PDF</div>' +
        '<div style="font-size:15px;font-weight:800;color:#3A2A24;margin-top:8px;">' + t.pdf + '</div>' +
        '<div style="font-size:13px;color:#7A6054;line-height:1.75;margin-top:7px;">인쇄해서 하루 10분씩 따라 하면 돼요. PDF 비밀번호: <b>' + BOOSTER.password + '</b></div>' +
        '<a href="' + BOOSTER.url + '" style="display:inline-block;margin-top:13px;font-size:14px;font-weight:700;color:#fff;background:#9A6070;text-decoration:none;border-radius:11px;padding:11px 20px;">📄 PDF 받기</a>' +
      '</td></tr></table>' +
    '</td></tr>' +

    // 추천 학습 순서
    '<tr><td style="padding:26px 26px 0;">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#9A6070;">LJ쌤의 추천 학습 순서</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:13px;">' + steps + '</table>' +
    '</td></tr>' +

    // 4주 루틴
    '<tr><td style="padding:24px 26px 0;">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#9A6070;">4주 루틴</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:13px;">' + weeks + '</table>' +
    '</td></tr>' +

    // 체험 신청 CTA
    '<tr><td style="padding:22px 26px 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2E4E9;border-radius:16px;">' +
      '<tr><td style="padding:22px 20px;text-align:center;">' +
        '<div style="font-size:16px;font-weight:800;color:#3A2A24;line-height:1.5;">이 4주를 LJ쌤과 함께<br>체계적으로 연습해보세요</div>' +
        '<div style="font-size:13px;color:#7A6054;line-height:1.75;margin-top:10px;">먼저 <b style="color:#7A4A5A;">5일 무료 체험</b>으로 이 방식이 나와 맞는지 확인해보실 수 있어요. 결제 정보 없이 바로 시작됩니다.</div>' +
        '<a href="' + TRIAL_URL + '" style="display:inline-block;margin-top:16px;background:#9A6070;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;padding:15px 28px;">5일 무료 체험 시작하기 →</a>' +
      '</td></tr></table>' +
    '</td></tr>' +

    // 푸터
    '<tr><td style="padding:26px;text-align:center;">' +
      '<div style="border-top:1px solid #E8D4DA;padding-top:20px;">' +
        '<div style="font-size:12px;font-weight:800;letter-spacing:.14em;color:#7A4A5A;">LJ ENGLISH</div>' +
        '<div style="font-size:11px;color:#B09A90;line-height:1.7;margin-top:6px;">© LJ ENGLISH · 음성학 전문 성인 회화</div>' +
        '<div style="font-size:12px;line-height:1.7;margin-top:10px;"><a href="' + KAKAO_URL + '" style="color:#7A4A5A;text-decoration:underline;">궁금한 점은 카톡으로 물어보세요</a></div>' +
      '</div>' +
    '</td></tr>' +

  '</table></td></tr></table></div>';
}
