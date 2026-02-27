// Google Apps Script - 統合データ転送版（ヘッダー作成改善）

// スプレッドシートID（実際のものに置き換えてください）
const SPREADSHEET_ID = '1uT8zB--MMdP_jLZ4CkRoGGEE0zcOdXfnrgBiNvhJntU';

/**
 * GETリクエストの処理
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'GAS is running'
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POSTリクエストの処理
 */
function doPost(e) {
  try {
    let data;
    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('POSTデータが見つかりません');
    }
    
    if (!data.anonymous_code || !data.page || !data.payload) {
      throw new Error('必須データが不足しています');
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const result = writeAllSurveyData(ss, data);
    
    return createCorsResponse({
      status: 'success',
      message: 'データが統合シートに保存されました',
      data: result
    });
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createCorsResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

function createCorsResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 全データを統合シート「All-survey」に1行で書き込み/更新
 */
function writeAllSurveyData(ss, data) {
  const sheetName = 'All-survey';
  let sheet = ss.getSheetByName(sheetName);
  
  // ヘッダー定義
  const headers = [
    'Anonymous Code', 'Gender', 'Age',
    // --- Pre-Survey ---
    'Pre_Timestamp',
    'Pre_LS_Q1', 'Pre_LS_Q2', 'Pre_LS_Q3', 'Pre_LS_Q4', 'Pre_LS_Q5', 'Pre_LS_Q6', 'Pre_LS_Q7', 'Pre_LS_Q8',
    'Pre_SE_Q9', 'Pre_SE_Q10', 'Pre_SE_Q11', 'Pre_SE_Q12', 'Pre_SE_Q13', 'Pre_SE_Q14', 'Pre_SE_Q15',
    'Pre_SE_Q16', 'Pre_SE_Q17', 'Pre_SE_Q18', 'Pre_SE_Q19', 'Pre_SE_Q20', 'Pre_SE_Q21',
    'Pre_PTG_Q22', 'Pre_PTG_Q23', 'Pre_PTG_Q24', 'Pre_PTG_Q25', 'Pre_PTG_Q26', 'Pre_PTG_Q27',
    'Pre_PTG_Q28', 'Pre_PTG_Q29', 'Pre_PTG_Q30', 'Pre_PTG_Q31', 'Pre_PTG_Q32', 'Pre_PTG_Q33',
    'Pre_PTG_Q34', 'Pre_PTG_Q35', 'Pre_PTG_Q36',
    // --- Game Data ---
    'Game_Timestamp', 'Stage1_Start', 'Stage1_End', 'Stage1_Cards_JSON',
    'Stage2_Start', 'Stage2_End', 'Stage2_Stories_JSON',
    'Stage3_Start', 'Stage3_End', 'Stage3_Mode', 'Stage3_Rolls_JSON',
    'Stage3_Remaining_JSON', 'Stage3_Lost_JSON', 'Interim_Message',
    // --- Post-Survey ---
    'Post_Timestamp',
    'Post_LS_Q1', 'Post_LS_Q2', 'Post_LS_Q3', 'Post_LS_Q4', 'Post_LS_Q5', 'Post_LS_Q6', 'Post_LS_Q7', 'Post_LS_Q8',
    'Post_SE_Q9', 'Post_SE_Q10', 'Post_SE_Q11', 'Post_SE_Q12', 'Post_SE_Q13', 'Post_SE_Q14', 'Post_SE_Q15',
    'Post_SE_Q16', 'Post_SE_Q17', 'Post_SE_Q18', 'Post_SE_Q19', 'Post_SE_Q20', 'Post_SE_Q21',
    'Post_PTG_Q22', 'Post_PTG_Q23', 'Post_PTG_Q24', 'Post_PTG_Q25', 'Post_PTG_Q26', 'Post_PTG_Q27',
    'Post_PTG_Q28', 'Post_PTG_Q29', 'Post_PTG_Q30', 'Post_PTG_Q31', 'Post_PTG_Q32', 'Post_PTG_Q33',
    'Post_PTG_Q34', 'Post_PTG_Q35', 'Post_PTG_Q36',
    'LE_Q37', 'LE_Q38', 'LE_Q39', 'LE_Q40', 'LE_Q41', 'LE_Q42', 'LE_Q43',
    'LE_Q44', 'LE_Q45', 'LE_Q46', 'LE_Q47', 'LE_Q48', 'LE_Q49', 'LE_Q50',
    'LE_Q51', 'LE_Q52', 'Feedback'
  ];

  // シートがなければ作成、あれば中身をチェック
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // 1行目が空（ヘッダーがない）ならヘッダーを書き込む
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1); // ヘッダーを固定
  }

  // 既存ユーザーを検索
  const lastRow = sheet.getLastRow();
  let rowIndex = -1;
  if (lastRow > 1) {
    const codes = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < codes.length; i++) {
      if (codes[i][0] === data.anonymous_code) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  // 行データの初期化
  let rowData;
  if (rowIndex !== -1) {
    rowData = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  } else {
    rowData = new Array(headers.length).fill('');
    rowData[0] = data.anonymous_code;
    rowData[1] = data.gender;
    rowData[2] = data.age;
  }

  // 送信元ページに応じて値をセット
  const pl = data.payload;
  if (data.page === 'pre') {
    rowData[3] = data.timestamp;
    for (let i = 1; i <= 8; i++) rowData[3 + i] = pl.life_satisfaction?.[`q${i}`] || '';
    for (let i = 9; i <= 21; i++) rowData[3 + i] = pl.self_efficacy?.[`q${i}`] || '';
    for (let i = 22; i <= 36; i++) rowData[3 + i] = pl.post_traumatic_growth?.[`q${i}`] || '';
  } 
  else if (data.page === 'game') {
    rowData[40] = data.timestamp;
    rowData[41] = pl.stage1?.startTime || '';
    rowData[42] = pl.stage1?.endTime || '';
    rowData[43] = JSON.stringify(pl.stage1?.cards || []);
    rowData[44] = pl.stage2?.startTime || '';
    rowData[45] = pl.stage2?.endTime || '';
    rowData[46] = JSON.stringify(pl.stage2?.selectedCards || []);
    rowData[47] = pl.stage3?.startTime || '';
    rowData[48] = pl.stage3?.endTime || '';
    rowData[49] = pl.stage3?.mode || '';
    rowData[50] = JSON.stringify(pl.stage3?.rolls || []);
    rowData[51] = JSON.stringify(pl.stage3?.remainingCards || []);
    rowData[52] = JSON.stringify(pl.stage3?.lostCards || []);
    rowData[53] = pl.interimMessage || '';
  } 
  else if (data.page === 'post') {
    rowData[54] = data.timestamp;
    for (let i = 1; i <= 8; i++) rowData[54 + i] = pl.life_satisfaction?.[`q${i}`] || '';
    for (let i = 9; i <= 21; i++) rowData[54 + i] = pl.self_efficacy?.[`q${i}`] || '';
    for (let i = 22; i <= 36; i++) rowData[54 + i] = pl.post_traumatic_growth?.[`q${i}`] || '';
    for (let i = 37; i <= 52; i++) rowData[54 + i] = pl.learning_engagement?.[`q${i}`] || '';
    rowData[107] = pl.feedback || ''; // フィードバックのインデックスを修正
  }

  // シートへ書き込み
  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: 'success', anonymous_code: data.anonymous_code, page: data.page };
}

/**
 * 【テスト用】手動でヘッダーを作成したい場合に実行してください
 */
function manualSetup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const testData = { anonymous_code: 'INIT', page: 'init', payload: {} };
  writeAllSurveyData(ss, testData);
  Logger.log('Setup completed.');
}
