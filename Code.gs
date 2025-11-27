function doPost(e) {
  // CORS対応のため、Content-Typeをtext/plainに設定
  const headers = {
    'Access-Control-Allow-Origin': '*', // すべてのオリジンからのアクセスを許可
    'Content-Type': 'text/plain'
  };

  try {
    // POSTされたJSONデータを解析
    const requestData = JSON.parse(e.postData.contents);
    
    // アクティブなスプレッドシートを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0]; // "Sheet1"というシート名がなければ最初のシートを使用

    // ヘッダー行が存在しない場合、ヘッダーを書き込む
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Student ID",
        "Student Name",
        "Stage1 Cards",
        "Stage2 Stories",
        "Stage3 Mode",
        "Stage3 Rolls",
        "Stage3 Remaining Cards",
        "Stage3 Lost Cards",
        "Interim Message"
      ];
      sheet.appendRow(headers);
    }

    // データを行データに変換
    const rowData = [
      requestData.timestamp,
      requestData.student_id,
      requestData.student_name,
      requestData.stage1_cards,
      requestData.stage2_stories,
      requestData.stage3_mode,
      requestData.stage3_rolls,
      requestData.stage3_remaining,
      requestData.stage3_lost,
      requestData.interim_message
    ];

    // スプレッドシートにデータを追記
    sheet.appendRow(rowData);

    // 成功レスポンス
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data received and recorded." }))
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // エラーレスポンス
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message, stack: error.stack }))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}