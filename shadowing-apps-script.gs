const SHEET_NAME = '쉐도잉챌린지신청';

function doGet(e) {
  try {
    const p = e.parameter;

    // 테스트 연결 확인용 (name 없으면 연결 테스트)
    if (!p.name) {
      return ContentService
        .createTextOutput('연결 성공!')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        '제출시간', '이름', '카카오톡 ID',
        '기대하는 변화', '기대되는 혜택',
        '선택 옵션', '입금 확인', '입금자명(다를 경우)',
        '환급조건 확인', '개인정보 동의'
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }

    sheet.appendRow([
      p.submittedAt,
      p.name,
      p.kakaoId,
      p.expectedChange,
      p.expectedBenefit,
      p.option,
      p.payment,
      p.paymentNote || '',
      p.refundConfirm || '',
      p.privacyConsent
    ]);

    return ContentService
      .createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService
      .createTextOutput('Error: ' + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// POST도 같이 처리 (혹시 모르니)
function doPost(e) {
  return doGet(e);
}
