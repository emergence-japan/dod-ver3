// survey.js - 修正版

// 重要: surveyDataはapp.jsで初期化されているので、ここでは参照のみ
// グローバル変数として window.surveyData を使用

// Initialize survey functionality
function initializeSurveys() {
  // Pre-survey form handling
  const preSurveyForm = document.getElementById('pre-survey-form');
  if (preSurveyForm) {
    preSurveyForm.addEventListener('submit', handlePreSurveySubmit);

    // Progress tracking
    trackSurveyProgress('pre-survey-form', 'pre-survey-progress', 'answered-count', 36);
  }

  // Post-survey form handling
  const postSurveyForm = document.getElementById('post-survey-form');
  if (postSurveyForm) {
    postSurveyForm.addEventListener('submit', handlePostSurveySubmit);

    // Progress tracking
    trackSurveyProgress('post-survey-form', 'post-survey-progress', 'post-answered-count', 53);
  }
}

// Track survey completion progress
function trackSurveyProgress(formId, progressBarId, counterId, total) {
  const form = document.getElementById(formId);
  const progressBar = document.getElementById(progressBarId);
  const counter = document.getElementById(counterId);
  const totalCount = form ? form.querySelector('.total-count') : null;

  if (!form || !progressBar) return;

  if (totalCount) {
    totalCount.textContent = total;
  }

  // Get all required inputs
  const requiredInputs = form.querySelectorAll('[required]');

  // Update progress
  function updateProgress() {
    let answered = 0;
    const countedNames = new Set();

    requiredInputs.forEach(input => {
      let isAnswered = false;
      if (input.type === 'radio' || input.type === 'checkbox') {
        const name = input.name;
        if (!countedNames.has(name)) {
          const checked = form.querySelector(`[name="${name}"]:checked`);
          if (checked) {
            isAnswered = true;
            countedNames.add(name);
          }
        }
      } else if (input.value.trim() !== '') {
        isAnswered = true;
      }

      if (isAnswered) {
        answered++;
      }
    });

    const percentage = (answered / total) * 100;
    progressBar.style.width = `${percentage}%`;

    if (counter) {
      counter.textContent = answered;
    }
  }

  // Listen to all input changes
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  // Initial update
  updateProgress();
}

// Handle pre-survey submission
async function handlePreSurveySubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector('[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = '送信中...';

  const formData = new FormData(form);
  const data = {
    life_satisfaction: {},
    self_efficacy: {},
    post_traumatic_growth: {}
  };

  // リッカート尺度の質問を処理
  for (let i = 1; i <= 8; i++) { // Q1-Q8: Life Satisfaction
    data.life_satisfaction[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }
  for (let i = 9; i <= 21; i++) { // Q9-Q21: Self-Efficacy
    data.self_efficacy[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }
  for (let i = 22; i <= 36; i++) { // Q22-Q36: Post-Traumatic Growth
    data.post_traumatic_growth[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }

  // Store in global surveyData
  if (typeof window.surveyData !== 'undefined') {
    window.surveyData.preSurvey = data;
  }

  // データを送信
  const success = await submitToGAS({ page: 'pre', payload: data });

  if (success) {
    showNotification('事前アンケートへのご協力、ありがとうございました。', 'success');
    setTimeout(() => {
      location.replace('index.html');
    }, 1500);
  } else {
    showNotification('データの送信に失敗しました。もう一度お試しください。', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Handle post-survey submission
async function handlePostSurveySubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector('[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = '送信中...';

  const formData = new FormData(form);
  const data = {
    life_satisfaction: {},
    self_efficacy: {},
    post_traumatic_growth: {},
    learning_engagement: {},
    feedback: ''
  };

  // Process Likert scale questions
  for (let i = 1; i <= 8; i++) { // Q1-Q8: Life Satisfaction
    data.life_satisfaction[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }
  for (let i = 9; i <= 21; i++) { // Q9-Q21: Self-Efficacy
    data.self_efficacy[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }
  for (let i = 22; i <= 36; i++) { // Q22-Q36: Post-Traumatic Growth
    data.post_traumatic_growth[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }
  for (let i = 37; i <= 52; i++) { // Q37-Q52: Learning Engagement
    data.learning_engagement[`q${i}`] = parseInt(formData.get(`q${i}`), 10) || null;
  }

  // Q53: Open-ended feedback
  data.feedback = formData.get('q53') || '';

  // Store in global surveyData
  if (typeof window.surveyData !== 'undefined') {
    window.surveyData.postSurvey = data;
  }

  // Send to Google Sheets
  showNotification('データを送信しています...', 'info');
  const success = await submitToGAS({ page: 'post', payload: data });

  if (success) {
    showNotification('アンケートへのご協力、ありがとうございました!', 'success');
    setTimeout(() => {
      location.replace('index.html');
    }, 1500);
  } else {
    showNotification('データの送信に失敗しました。', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Notification system
function showNotification(message, type = 'info') {
  // 既存の通知を削除
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // スタイルを追加（CSSで定義されていない場合）
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: 'Lora', serif;
    font-size: 14px;
    max-width: 300px;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
  `;

  // Type-specific colors
  const colors = {
    info: { bg: '#3B82F6', text: '#FFFFFF' },
    success: { bg: '#10B981', text: '#FFFFFF' },
    error: { bg: '#EF4444', text: '#FFFFFF' }
  };

  const color = colors[type] || colors.info;
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSurveys);