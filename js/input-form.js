/**
 * 属性入力フォームをコンテナにレンダリングします。
 * @param {HTMLElement} container - フォームを挿入する親要素
 * @param {object} initialValues - 初期値（オプション）
 */
function renderAttributeInput(container, initialValues = null) {
  if (!container) return;

  const html = `
      <div class="question-group">
        <label for="anonymousCode" class="question-label">匿名コード</label>
        <p class="question-help">後のアンケートで個人を特定するために使用します。半角英数字で入力してください。</p>
        <input type="text" id="anonymousCode" name="anonymousCode" class="text-input" required>
      </div>

      <div class="question-group">
        <label for="gender" class="question-label">性別</label>
        <select id="gender" name="gender" class="text-input form-select" required>
          <option value="">選択してください</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
          <option value="prefer_not_to_answer">回答しない</option>
        </select>
      </div>

      <div class="question-group">
        <label for="age" class="question-label">年齢</label>
        <div class="age-input-wrapper">
            <input type="number" id="age" name="age" min="6" max="120" class="number-input" required>
            <span class="input-suffix">歳</span>
        </div>
      </div>

      <div class="form-actions" style="border-top: none; padding-top: 0; margin-top: var(--spacing-md);">
        <button id="saveAndProceed" class="btn-primary">入力内容を確定する</button>
      </div>
  `;

  container.innerHTML = html;

  if (initialValues) {
    const anonymousCodeEl = container.querySelector('#anonymousCode');
    const genderEl = container.querySelector('#gender');
    const ageEl = container.querySelector('#age');

    if (anonymousCodeEl) anonymousCodeEl.value = initialValues.anonymousCode || '';
    if (genderEl) genderEl.value = initialValues.gender || '';
    if (ageEl) ageEl.value = initialValues.age || '';
  }
}
