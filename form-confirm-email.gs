// ════════════════════════════════════════════════════
//  구글폼 신청 → 신청자에게 확인 메일 + 선생님께 알림
// ════════════════════════════════════════════════════
//  설치 방법
//   1) 구글폼 편집 화면 → 오른쪽 위 ⋮ → "Apps Script"
//   2) 이 파일 내용을 통째로 붙여넣고 저장
//   3) 왼쪽 ⏰(트리거) → "트리거 추가"
//        실행할 함수      : onFormSubmit
//        이벤트 소스      : 양식에서
//        이벤트 유형      : 양식 제출 시
//   4) 저장하면 권한 승인 창이 뜹니다 → 허용
//
//  ⚠️ 3번 트리거를 만들지 않으면 함수 이름이 맞아도 절대 실행되지 않습니다.
//     (가장 흔한 "메일이 안 나가요" 원인)
//
//  확인 방법 : Apps Script 왼쪽 "실행" 메뉴에서 실행 기록/오류를 볼 수 있습니다.
//  발송 한도 : 일반 Gmail 계정은 하루 100통 (MailApp 기준)
// ════════════════════════════════════════════════════


// ────────── 매달 바뀌는 값 (여기만 고치면 됩니다) ──────────
const CONFIG = {
  startDateText : '매달 첫째 주 월요일',                            // 챌린지 시작 시점
  openChatUrl   : 'https://invite.kakao.com/tc/Fr39PoDNuc',        // 팀 오픈채팅방
  bankName      : '카카오뱅크',
  bankAccount   : '3333-19-4033339',
  bankHolder    : '이진',
  appUrl        : 'https://jinlee8381-max.github.io/shadowing-challenge',
  inquiryUrl    : 'https://pf.kakao.com/_lvxoLxj/chat',             // 카카오톡 채널 문의
  adminEmail    : 'jinlee8381@gmail.com',                           // 신청 알림 받을 주소
  notifyAdmin   : true                                              // 선생님 알림 메일 on/off
};
// ────────────────────────────────────────────────────────


// ── 다음 챌린지 시작일(첫째 주 월요일) 자동 계산 ──
// 이번 달 첫째 주 월요일이 아직 안 지났으면 그 날짜, 지났으면 다음 달 첫째 주 월요일.
function firstMondayOf(year, monthIndex) {
  const d = new Date(year, monthIndex, 1);
  // getDay(): 0=일 … 1=월
  const shift = (8 - d.getDay()) % 7;   // 1일이 월요일이면 0, 화요일이면 6 …
  d.setDate(1 + shift);
  return d;
}

function nextStartDate(today) {
  const t = today || new Date();
  t.setHours(0, 0, 0, 0);
  let d = firstMondayOf(t.getFullYear(), t.getMonth());
  if (d < t) d = firstMondayOf(t.getFullYear(), t.getMonth() + 1);  // 이미 지났으면 다음 달
  return d;
}

function formatStartDate(d) {
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일(월)';
}


function onFormSubmit(e) {
  try {
    const answers = readAnswers(e);

    if (!answers.email) {
      console.warn('이메일을 찾지 못해 발송하지 않음. 받은 답변: ' + JSON.stringify(answers));
      return;
    }

    // ① 신청자에게 확인 메일
    MailApp.sendEmail({
      to       : answers.email,
      subject  : '[LJ ENGLISH CLASS] 쉐도잉 챌린지 신청이 접수됐어요 🎉',
      htmlBody : buildApplicantMail(answers),
      name     : 'LJ ENGLISH CLASS'
    });
    console.log('신청 확인 메일 발송 완료 → ' + answers.email);

    // ② 선생님에게 알림 메일
    if (CONFIG.notifyAdmin && CONFIG.adminEmail) {
      MailApp.sendEmail({
        to       : CONFIG.adminEmail,
        subject  : '📥 새 신청 — ' + (answers.name || '이름없음') + ' / ' + (answers.option || '옵션미확인'),
        htmlBody : buildAdminMail(answers),
        name     : '쉐도잉 챌린지 신청 알림'
      });
      console.log('선생님 알림 메일 발송 완료');
    }

  } catch (err) {
    // 여기서 삼키지 않고 로그를 남겨야 나중에 원인을 찾을 수 있음
    console.error('onFormSubmit 실패: ' + err + '\n' + (err.stack || ''));
    throw err;
  }
}


// ── 폼 응답에서 필요한 값 뽑기 ──
function readAnswers(e) {
  const out = { name:'', email:'', kakao:'', option:'', etc:[] };

  const items = e.response.getItemResponses();
  items.forEach(function (it) {
    const title = it.getItem().getTitle();
    const ans   = String(it.getResponse() || '').trim();
    if (!ans) return;

    if (title.indexOf('이름') > -1 && !out.name)        out.name   = ans;
    else if (title.indexOf('이메일') > -1 && !out.email) out.email  = ans;
    else if (title.indexOf('카카오톡') > -1)             out.kakao  = ans;
    else if (title.indexOf('옵션') > -1)                 out.option = ans;
    else out.etc.push({ q: title, a: ans });
  });

  // 폼 설정에서 "이메일 주소 수집"을 켠 경우 (현재 이 방식으로 수집 중)
  if (!out.email) {
    try { out.email = e.response.getRespondentEmail(); } catch (err) {}
  }
  return out;
}


// ── 신청자에게 보내는 메일 ──
function buildApplicantMail(a) {
  const box = 'border:1px solid #E8D4DA;border-radius:14px;padding:16px 18px;margin-bottom:16px;';
  const h   = 'font-size:14px;font-weight:800;color:#7A4A5A;margin:0 0 9px;';
  const p   = 'font-size:13px;color:#3A2A24;margin:0;line-height:1.85;word-break:keep-all;';

  return '' +
  '<div style="font-family:-apple-system,\'Apple SD Gothic Neo\',\'Noto Sans KR\',sans-serif;background:#FAF8F5;padding:24px 10px;">' +
    '<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E8D4DA;border-radius:20px;padding:30px 18px;color:#3A2A24;line-height:1.75;">' +

      '<div style="text-align:center;font-size:36px;line-height:1;margin-bottom:12px;">🎉</div>' +
      '<h1 style="text-align:center;font-size:17px;font-weight:800;margin:0 0 8px;word-break:keep-all;">' +
        (a.name ? a.name + '님, 신청이 접수됐어요!' : '신청이 접수됐어요!') + '</h1>' +
      '<p style="text-align:center;font-size:13px;color:#7A6054;margin:0 0 24px;word-break:keep-all;">' +
        '쉐도잉 챌린지는 <strong>' + CONFIG.startDateText + '</strong>에 시작됩니다.<br>' +
        '다음 시작일은 <strong style="color:#7A4A5A;">' + formatStartDate(nextStartDate()) + '</strong>이에요.</p>' +

      // 입금 안내
      '<div style="' + box + 'background:#FAF8F5;">' +
        '<p style="' + h + '">💳 입금 안내</p>' +
        '<p style="' + p + '">' +
          CONFIG.bankName + ' <strong>' + CONFIG.bankAccount + '</strong><br>' +
          '예금주 ' + CONFIG.bankHolder +
          (a.option ? '<br><br>신청하신 옵션<br><strong>' + a.option + '</strong>' : '') +
        '</p>' +
        '<p style="font-size:12px;color:#7A6054;margin:10px 0 0;line-height:1.7;">' +
          '※ <strong>입금자명이 신청자명과 다르면</strong> 확인이 어려우니 꼭 알려주세요.</p>' +
      '</div>' +

      // 다음 절차
      '<div style="' + box + '">' +
        '<p style="' + h + '">✅ 이렇게 진행돼요</p>' +
        '<p style="' + p + '">' +
          '① 신청하신 옵션 비용 입금을 확인해 주세요<br>' +
          '② 선생님이 입금을 확인합니다<br>' +
          '③ 팀 채팅방 입장이 승인돼요<br>' +
          '④ <strong>' + formatStartDate(nextStartDate()) + '</strong> 챌린지 시작!' +
        '</p>' +
        '<p style="font-size:12px;color:#7A6054;margin:10px 0 0;line-height:1.7;">' +
          '학습 앱 주소와 사용법은 <strong>입금 확인 후 채팅방에서</strong> 안내드립니다.</p>' +
      '</div>' +

      // 오픈채팅방
      '<div style="text-align:center;margin-bottom:20px;">' +
        '<a href="' + CONFIG.openChatUrl + '" style="display:inline-block;background:#9A6070;color:#fff;text-decoration:none;font-size:15px;font-weight:800;padding:15px 26px;border-radius:100px;">' +
          '💬 팀 채팅방 입장하기' +
        '</a>' +
        '<p style="font-size:12px;color:#B09A90;margin:11px 0 0;line-height:1.7;">' +
          '입금자 이름 확인 후 입장이 승인됩니다.<br>' +
          '채팅방 이름이 입금자명과 다르면 입장하면서 실명을 알려주세요.</p>' +
      '</div>' +

      '<p style="text-align:center;font-size:13px;color:#7A6054;margin:0 0 14px;word-break:keep-all;">' +
        '궁금한 점은 언제든 편하게 물어봐 주세요.</p>' +
      '<div style="text-align:center;">' +
        '<a href="' + CONFIG.inquiryUrl + '" style="display:inline-block;background:#fff;color:#9A6070;text-decoration:none;font-size:14px;font-weight:800;padding:13px 26px;border:1.5px solid #C49AAA;border-radius:100px;">' +
          '💬 카카오톡으로 문의하기</a>' +
      '</div>' +

      '<p style="text-align:center;font-size:12px;color:#B09A90;margin:22px 0 0;">— LJ ENGLISH CLASS</p>' +
    '</div>' +
  '</div>';
}


// ── 선생님에게 보내는 알림 메일 ──
function buildAdminMail(a) {
  // 핵심 정보 4가지를 위에, 나머지 답변은 아래에 (표 대신 위아래로 쌓아 잘리지 않게)
  let main =
    block('이름',        a.name)  +
    block('이메일',      a.email) +
    block('카카오톡 ID', a.kakao) +
    block('선택 옵션',   a.option, true);

  let rest = '';
  a.etc.forEach(function (x) { rest += block(x.q, x.a); });

  return '' +
  '<div style="font-family:-apple-system,\'Apple SD Gothic Neo\',\'Noto Sans KR\',sans-serif;max-width:560px;margin:0 auto;padding:20px 16px;color:#222;">' +
    '<h2 style="font-size:16px;margin:0 0 16px;">📥 쉐도잉 챌린지 새 신청</h2>' +
    main +
    (rest ? '<p style="font-size:12px;font-weight:700;color:#888;margin:22px 0 10px;">그 외 답변</p>' + rest : '') +
    '<p style="font-size:12px;color:#666;margin-top:22px;line-height:1.8;">' +
      '입금 확인 후 <b>관리자 → 학생 관리</b>에서 명단에 추가해 주세요.<br>' +
      '<a href="' + CONFIG.appUrl + '/admin-students.html">' + CONFIG.appUrl + '/admin-students.html</a>' +
    '</p>' +
  '</div>';

  // 라벨은 위, 값은 아래 — 질문이 아무리 길어도 잘리지 않음
  function block(k, v, highlight) {
    if (!v) return '';
    return '' +
    '<div style="border:1px solid #E5E5E5;border-radius:8px;padding:10px 12px;margin-bottom:8px;' +
      (highlight ? 'background:#FFF6F9;border-color:#E8D4DA;' : 'background:#FAFAFA;') + '">' +
      '<div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px;word-break:break-all;">' + k + '</div>' +
      '<div style="font-size:14px;font-weight:700;color:#222;line-height:1.6;word-break:break-all;">' + v + '</div>' +
    '</div>';
  }
}


// ── 설치 후 한 번 눌러서 확인하는 테스트 함수 ──
// Apps Script 위쪽 함수 선택창에서 testMail 고르고 ▶ 실행
function testMail() {
  const sample = {
    name: '테스트', email: CONFIG.adminEmail, kakao: 'test_id',
    option: '쉐도잉 챌린지 참여비- 월 12만원', etc: []
  };
  MailApp.sendEmail({
    to: CONFIG.adminEmail,
    subject: '[테스트] 쉐도잉 챌린지 신청 확인 메일',
    htmlBody: buildApplicantMail(sample),
    name: 'LJ ENGLISH CLASS'
  });
  console.log('테스트 메일 발송 → ' + CONFIG.adminEmail);
}
