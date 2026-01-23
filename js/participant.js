// participant.js

const PARTICIPANT_KEY = 'participant';

/**
 * 参加者情報をsessionStorageから取得します。
 * @returns {object | null} 参加者情報オブジェクト、または存在しない場合はnull。
 */
function getParticipant() {
  const participantData = sessionStorage.getItem(PARTICIPANT_KEY);
  return participantData ? JSON.parse(participantData) : null;
}

/**
 * 参加者情報をsessionStorageに保存します。
 * @param {object} participantData - 保存する参加者情報。
 * @param {string} participantData.anonymousCode - 匿名コード。
 * @param {string} participantData.gender - 性別。
 * @param {number} participantData.age - 年齢。
 */
function saveParticipant(participantData) {
  if (!participantData.anonymousCode || !participantData.gender || !participantData.age) {
    console.error('Validation Error: All participant fields are required.');
    alert('すべての項目を入力してください。');
    return false;
  }
  sessionStorage.setItem(PARTICIPANT_KEY, JSON.stringify(participantData));
  return true;
}

/**
 * 参加者情報をsessionStorageから削除します。
 */
function clearParticipant() {
  sessionStorage.removeItem(PARTICIPANT_KEY);
}

/**
 * 参加者情報が存在しない場合、index.htmlにリダイレクトします。
 * @deprecated この関数は新しいフローでは使用しません。代わりに requireParticipantOrInput を使用してください。
 */
function requireParticipantOrRedirect() {
  const participant = getParticipant();
  if (!participant) {
    location.replace('index.html');
  }
}

/**
 * 参加者情報を確認し、存在しない場合は入力フォームを表示します。
 * 存在する場合、または入力が完了した後に callback を実行します。
 * 
 * @param {HTMLElement} container - 入力フォームを表示するコンテナ要素
 * @param {Function} onSuccess - 参加者情報が確認できた後に実行するコールバック
 */
function requireParticipantOrInput(container, onSuccess) {
  const participant = getParticipant();
  
  if (participant) {
    // すでに情報がある場合はそのまま進む
    if (onSuccess) onSuccess();
    return;
  }

  // 情報がない場合、フォームを表示
  if (typeof renderAttributeInput === 'function') {
    renderAttributeInput(container);
    
    // イベントリスナー設定
    const saveBtn = container.querySelector('#saveAndProceed');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const anonymousCodeEl = container.querySelector('#anonymousCode');
            const genderEl = container.querySelector('#gender');
            const ageEl = container.querySelector('#age');
            
            if (!anonymousCodeEl || !genderEl || !ageEl) return;

            const data = {
                anonymousCode: anonymousCodeEl.value,
                gender: genderEl.value,
                age: parseInt(ageEl.value, 10)
            };
            
            if (saveParticipant(data)) {
                // コンテナをクリア
                container.innerHTML = ''; 
                if (onSuccess) onSuccess();
            }
        });
    }
  } else {
    console.error('renderAttributeInput function is not defined. Make sure input-form.js is loaded.');
  }
}