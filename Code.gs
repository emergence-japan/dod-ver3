// Google Apps Script - CORS対応版
// これをGoogle Apps Scriptエディタにコピーしてください

// スプレッドシートID（実際のIDに置き換えてください）
const SPREADSHEET_ID = '1uT8zB--MMdP_jLZ4CkRoGGEE0zcOdXfnrgBiNvhJntU';

/**
 * GETリクエストの処理（必須 - CORSプリフライトのため）
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'GET request received'
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POSTリクエストの処理
 */
function doPost(e) {
  try {
    let data;
    // 方法1: フォームパラメータからデータを取得（submit.jsのフォールバック用）
    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } 
    // 方法2: リクエストボディからデータを取得（通常のfetch用）
    else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } 
    // データが見つからない場合
    else {
      throw new Error('POSTデータが見つかりません');
    }
    
    // データを検証
    if (!data.anonymous_code || !data.page || !data.payload) {
      throw new Error('必須データが不足しています');
    }
    
    // スプレッドシートを取得
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // ページに応じて適切なシートに書き込み
    let result;
    switch (data.page) {
      case 'pre':
        result = writePreSurveyData(ss, data);
        break;
      case 'game':
        result = writeGameData(ss, data);
        break;
      case 'post':
        result = writePostSurveyData(ss, data);
        break;
      default:
        throw new Error('無効なページタイプ: ' + data.page);
    }
    
    // 成功レスポンスを返す（CORS対応）
    return createCorsResponse({
      status: 'success',
      message: 'データが正常に保存されました',
      data: result
    });
    
  } catch (error) {
    // エラーレスポンスを返す（CORS対応）
    Logger.log('Error in doPost: ' + error.toString());
    return createCorsResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * CORS対応のレスポンスを作成
 */
function createCorsResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORSヘッダーを追加（これが重要！）
  // 注: Google Apps ScriptのContentServiceではヘッダーを直接設定できないため、
  // JSONレスポンスとして返すことでCORS問題を回避します
  return output;
}

/**
 * 事前アンケートデータを書き込み
 */
function writePreSurveyData(ss, data) {
  const sheetName = 'Pre-Survey';
  let sheet = ss.getSheetByName(sheetName);
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // ヘッダー行を作成
    const headers = [
      'Timestamp', 'Anonymous Code', 'Gender', 'Age',
      // Life Satisfaction (Q1-Q8)
      'LS_Q1', 'LS_Q2', 'LS_Q3', 'LS_Q4', 'LS_Q5', 'LS_Q6', 'LS_Q7', 'LS_Q8',
      // Self-Efficacy (Q9-Q21)
      'SE_Q9', 'SE_Q10', 'SE_Q11', 'SE_Q12', 'SE_Q13', 'SE_Q14', 'SE_Q15',
      'SE_Q16', 'SE_Q17', 'SE_Q18', 'SE_Q19', 'SE_Q20', 'SE_Q21',
      // Post-Traumatic Growth (Q22-Q36)
      'PTG_Q22', 'PTG_Q23', 'PTG_Q24', 'PTG_Q25', 'PTG_Q26', 'PTG_Q27',
      'PTG_Q28', 'PTG_Q29', 'PTG_Q30', 'PTG_Q31', 'PTG_Q32', 'PTG_Q33',
      'PTG_Q34', 'PTG_Q35', 'PTG_Q36'
    ];
    sheet.appendRow(headers);
  }
  
  // データ行を作成
  const row = [
    data.timestamp,
    data.anonymous_code,
    data.gender,
    data.age
  ];
  
  // Life Satisfaction (Q1-Q8)
  for (let i = 1; i <= 8; i++) {
    row.push(data.payload.life_satisfaction[`q${i}`] || '');
  }
  
  // Self-Efficacy (Q9-Q21)
  for (let i = 9; i <= 21; i++) {
    row.push(data.payload.self_efficacy[`q${i}`] || '');
  }
  
  // Post-Traumatic Growth (Q22-Q36)
  for (let i = 22; i <= 36; i++) {
    row.push(data.payload.post_traumatic_growth[`q${i}`] || '');
  }
  
  sheet.appendRow(row);
  return { rowsAdded: 1 };
}

/**
 * ゲームデータを書き込み
 */
function writeGameData(ss, data) {
  const sheetName = 'Game-Data';
  let sheet = ss.getSheetByName(sheetName);
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = [
      'Timestamp', 'Anonymous Code', 'Gender', 'Age',
      'Stage1_Start', 'Stage1_End', 'Stage1_Cards_JSON',
      'Stage2_Start', 'Stage2_End', 'Stage2_Stories_JSON',
      'Stage3_Start', 'Stage3_End', 'Stage3_Mode', 'Stage3_Rolls_JSON',
      'Stage3_Remaining_JSON', 'Stage3_Lost_JSON',
      'Interim_Message'
    ];
    sheet.appendRow(headers);
  }
  
  const payload = data.payload;
  
  const row = [
    data.timestamp,
    data.anonymous_code,
    data.gender,
    data.age,
    // Stage 1
    payload.stage1?.startTime || '',
    payload.stage1?.endTime || '',
    JSON.stringify(payload.stage1?.cards || []),
    // Stage 2
    payload.stage2?.startTime || '',
    payload.stage2?.endTime || '',
    JSON.stringify(payload.stage2?.selectedCards || []),
    // Stage 3
    payload.stage3?.startTime || '',
    payload.stage3?.endTime || '',
    payload.stage3?.mode || '',
    JSON.stringify(payload.stage3?.rolls || []),
    JSON.stringify(payload.stage3?.remainingCards || []),
    JSON.stringify(payload.stage3?.lostCards || []),
    // Interim Message
    payload.interimMessage || ''
  ];
  
  sheet.appendRow(row);
  return { rowsAdded: 1 };
}

/**
 * 事後アンケートデータを書き込み
 */
function writePostSurveyData(ss, data) {
  const sheetName = 'Post-Survey';
  let sheet = ss.getSheetByName(sheetName);
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = [
      'Timestamp', 'Anonymous Code', 'Gender', 'Age',
      // Life Satisfaction (Q1-Q8)
      'LS_Q1', 'LS_Q2', 'LS_Q3', 'LS_Q4', 'LS_Q5', 'LS_Q6', 'LS_Q7', 'LS_Q8',
      // Self-Efficacy (Q9-Q21)
      'SE_Q9', 'SE_Q10', 'SE_Q11', 'SE_Q12', 'SE_Q13', 'SE_Q14', 'SE_Q15',
      'SE_Q16', 'SE_Q17', 'SE_Q18', 'SE_Q19', 'SE_Q20', 'SE_Q21',
      // Post-Traumatic Growth (Q22-Q36)
      'PTG_Q22', 'PTG_Q23', 'PTG_Q24', 'PTG_Q25', 'PTG_Q26', 'PTG_Q27',
      'PTG_Q28', 'PTG_Q29', 'PTG_Q30', 'PTG_Q31', 'PTG_Q32', 'PTG_Q33',
      'PTG_Q34', 'PTG_Q35', 'PTG_Q36',
      // Learning Engagement (Q37-Q52)
      'LE_Q37', 'LE_Q38', 'LE_Q39', 'LE_Q40', 'LE_Q41', 'LE_Q42', 'LE_Q43',
      'LE_Q44', 'LE_Q45', 'LE_Q46', 'LE_Q47', 'LE_Q48', 'LE_Q49', 'LE_Q50',
      'LE_Q51', 'LE_Q52',
      // Feedback (Q53)
      'Feedback'
    ];
    sheet.appendRow(headers);
  }
  
  const row = [
    data.timestamp,
    data.anonymous_code,
    data.gender,
    data.age
  ];
  
  // Life Satisfaction (Q1-Q8)
  for (let i = 1; i <= 8; i++) {
    row.push(data.payload.life_satisfaction[`q${i}`] || '');
  }
  
  // Self-Efficacy (Q9-Q21)
  for (let i = 9; i <= 21; i++) {
    row.push(data.payload.self_efficacy[`q${i}`] || '');
  }
  
  // Post-Traumatic Growth (Q22-Q36)
  for (let i = 22; i <= 36; i++) {
    row.push(data.payload.post_traumatic_growth[`q${i}`] || '');
  }
  
  // Learning Engagement (Q37-Q52)
  for (let i = 37; i <= 52; i++) {
    row.push(data.payload.learning_engagement[`q${i}`] || '');
  }
  
  // Feedback (Q53)
  row.push(data.payload.feedback || '');
  
  sheet.appendRow(row);
  return { rowsAdded: 1 };
}

/**
 * テスト用関数
 */
function testWriteData() {
  const testData = {
    anonymous_code: 'TEST001',
    gender: 'male',
    age: 25,
    page: 'pre',
    timestamp: new Date().toISOString(),
    payload: {
      life_satisfaction: { q1: 5, q2: 6, q3: 4, q4: 5, q5: 6, q6: 5, q7: 6, q8: 5 },
      self_efficacy: { 
        q9: 5, q10: 6, q11: 4, q12: 5, q13: 6, q14: 5, q15: 6,
        q16: 5, q17: 6, q18: 5, q19: 4, q20: 5, q21: 6
      },
      post_traumatic_growth: {
        q22: 4, q23: 5, q24: 6, q25: 5, q26: 4, q27: 5, q28: 6,
        q29: 5, q30: 4, q31: 5, q32: 6, q33: 5, q34: 4, q35: 5, q36: 6
      }
    }
  };
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const result = writePreSurveyData(ss, testData);
  Logger.log('Test result: ' + JSON.stringify(result));
}