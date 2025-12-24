// participant.js

const PARTICIPANT_KEY = 'participant';

/**
 * 参加者情報をlocalStorageから取得します。
 * @returns {object | null} 参加者情報オブジェクト、または存在しない場合はnull。
 */
function getParticipant() {
  const participantData = localStorage.getItem(PARTICIPANT_KEY);
  return participantData ? JSON.parse(participantData) : null;
}

/**
 * 参加者情報をlocalStorageに保存します。
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
  localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(participantData));
  return true;
}

/**
 * 参加者情報をlocalStorageから削除します。
 */
function clearParticipant() {
  localStorage.removeItem(PARTICIPANT_KEY);
}

/**
 * 参加者情報が存在しない場合、index.htmlにリダイレクトします。
 * 各ページの冒頭で呼び出して、直リンクを防ぎます。
 */
function requireParticipantOrRedirect() {
  const participant = getParticipant();
  if (!participant) {
    location.replace('index.html');
  }
}
