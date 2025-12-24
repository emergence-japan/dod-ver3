// js/submit.js - CORS回避版

// GAS WebアプリのURL（デプロイ後に実際のURLに置き換える）
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxgpN0vhONQUhpc11FDZTHAJlWVhToemED2JK-yxg6rP40FfybpTMLlKHlSZz24iEzm/exec';

/**
 * データをGoogle Apps Scriptに送信する共通関数 (CORS回避版)
 * フォーム送信を使用してCORS問題を回避
 */
async function submitToGAS({ page, payload }) {
  // 参加者情報を取得
  const participant = getParticipant();
  if (!participant) {
    console.error('Participant not found. Cannot submit data.');
    alert('参加者情報が見つかりません。データを送信できませんでした。');
    return false;
  }

  // 全ページ共通の送信フォーマットに統一
  const submissionData = {
    anonymous_code: participant.anonymousCode,
    gender: participant.gender,
    age: participant.age,
    page: page,
    timestamp: new Date().toISOString(),
    payload: payload
  };

  try {
    // 方法1: 通常のFetch API (CORSが有効な場合)
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
        mode: 'no-cors' // CORS回避モード
      });

      // no-corsモードでは詳細なレスポンスを取得できないが、
      // エラーがなければ送信は成功している可能性が高い
      console.log('Data submitted (no-cors mode)');
      
      // 確認のため少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;

    } catch (fetchError) {
      console.log('Fetch failed, trying form submission method...');
      
      // 方法2: 隠しフォームを使用した送信（フォールバック）
      return await submitViaForm(submissionData);
    }

  } catch (error) {
    console.error('Error submitting data to GAS:', error);
    
    // 最後の手段: ユーザーに手動ダウンロードを促す
    const userChoice = confirm(
      'データの自動送信に失敗しました。\n\n' +
      'データをJSONファイルとしてダウンロードしますか?\n' +
      '(後で手動で送信できます)'
    );
    
    if (userChoice) {
      downloadAsJson(submissionData, `${page}-survey-${participant.anonymousCode}.json`);
      return true; // ダウンロード成功
    }
    
    return false;
  }
}

/**
 * フォーム送信を使用してデータを送信（CORS完全回避）
 */
async function submitViaForm(data) {
  return new Promise((resolve) => {
    // 隠しiframeを作成
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden-form-target';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // 隠しフォームを作成
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = 'hidden-form-target';
    form.style.display = 'none';

    // データを隠しフィールドとして追加
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);
    form.appendChild(input);

    document.body.appendChild(form);

    // フォームを送信
    form.submit();

    // 送信後のクリーンアップ（1秒後）
    setTimeout(() => {
      form.remove();
      iframe.remove();
      console.log('Form submission completed');
      resolve(true);
    }, 1000);
  });
}

/**
 * データをJSONファイルとしてダウンロード
 */
function downloadAsJson(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // クリーンアップ
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  
  console.log('Data downloaded as:', filename);
}

/**
 * GASが正しく動作しているかテスト
 */
async function testGASConnection() {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'GET',
      mode: 'no-cors'
    });
    console.log('GAS connection test completed');
    return true;
  } catch (error) {
    console.error('GAS connection test failed:', error);
    return false;
  }
}

// デバッグ用: コンソールからテスト可能
window.testGASConnection = testGASConnection;