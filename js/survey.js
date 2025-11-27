// survey.js

// Google Apps Script URL (replace with your deployed URL)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIrBrR2oeM4aeMmfO1N9KCUKGodV4yf6l4-KnjoAjnF70s5ZLeeT10uwRereFRkjWW/exec';

// Store survey data
let surveyData = {
  preSurvey: {},
  gamePlay: {},
  postSurvey: {}
};

// Initialize survey functionality
function initializeSurveys() {
  // Pre-survey form handling
  const preSurveyForm = document.getElementById('pre-survey-form');
  if (preSurveyForm) {
    preSurveyForm.addEventListener('submit', handlePreSurveySubmit);

    // Progress tracking
    trackSurveyProgress('pre-survey-form', 'pre-survey-progress', 'answered-count', 45);

    // Ethnicity validation removed - all fields now optional
  }

  // Post-survey form handling
  const postSurveyForm = document.getElementById('post-survey-form');
  if (postSurveyForm) {
    postSurveyForm.addEventListener('submit', handlePostSurveySubmit);

    // Pre-fill anonymous code if available
    const savedCode = sessionStorage.getItem('anonymous_code');
    if (savedCode) {
      const postAnonCode = document.getElementById('post-anonymous-code');
      if (postAnonCode) {
        postAnonCode.value = savedCode;
      }
    }

    // Progress tracking
    trackSurveyProgress('post-survey-form', 'post-survey-progress', 'post-answered-count', 53);
  }
}

// Track survey completion progress
function trackSurveyProgress(formId, progressBarId, counterId, total) {
  const form = document.getElementById(formId);
  const progressBar = document.getElementById(progressBarId);
  const counter = document.getElementById(counterId);
  const totalCount = form.querySelector('.total-count');

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

// Ethnicity validation (at least one checkbox)
function setupEthnicityValidation() {
  const form = document.getElementById('pre-survey-form');
  if (!form) return;

  const checkboxes = form.querySelectorAll('input[name="ethnicity"]');
  const validationMsg = document.getElementById('ethnicity-validation');

  function validate() {
    const checked = form.querySelectorAll('input[name="ethnicity"]:checked');
    if (checked.length > 0) {
      checkboxes.forEach(cb => cb.setCustomValidity(''));
      if (validationMsg) validationMsg.classList.remove('show');
      return true;
    } else {
      checkboxes.forEach(cb => cb.setCustomValidity('Please select at least one option'));
      if (validationMsg) {
        validationMsg.textContent = 'Please select at least one option';
        validationMsg.classList.add('show');
      }
      return false;
    }
  }

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', validate);
  });

  form.addEventListener('submit', (e) => {
    if (!validate()) {
      e.preventDefault();
    }
  });
}

// Handle pre-survey submission
function handlePreSurveySubmit(e) {
  e.preventDefault();

  const form = e.target;

  // No validation required - all fields are optional

  // Collect form data
  const formData = new FormData(form);
  const data = {
    timestamp: new Date().toISOString(),
    demographics: {},
    life_satisfaction: {},
    self_efficacy: {},
    post_traumatic_growth: {}
  };

  // Process demographics
  data.demographics.anonymous_code = formData.get('anonymous_code');
  data.demographics.age = parseInt(formData.get('age'));
  data.demographics.gender = formData.get('gender');
  if (data.demographics.gender === 'Other') {
    data.demographics.gender_other = formData.get('gender_other');
  }

  // Ethnicity (multiple values)
  data.demographics.ethnicity = formData.getAll('ethnicity');
  if (data.demographics.ethnicity.includes('Other')) {
    data.demographics.ethnicity_other = formData.get('ethnicity_other');
  }

  data.demographics.academic_year = formData.get('academic_year');
  if (data.demographics.academic_year === 'Other') {
    data.demographics.academic_year_other = formData.get('academic_year_other');
  }

  data.demographics.major = formData.get('major');
  if (data.demographics.major === 'Other') {
    data.demographics.major_other = formData.get('major_other');
  }

  data.demographics.work_status = formData.get('work_status');
  data.demographics.marital_status = formData.get('marital_status');
  data.demographics.parental_status = formData.get('parental_status');

  // Process Likert scale questions
  for (let i = 10; i <= 17; i++) {
    data.life_satisfaction[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  for (let i = 18; i <= 30; i++) {
    data.self_efficacy[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  for (let i = 31; i <= 45; i++) {
    data.post_traumatic_growth[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  // Store data
  surveyData.preSurvey = data;

  // Save anonymous code for later use
  sessionStorage.setItem('anonymous_code', data.demographics.anonymous_code);

  // Navigate to opening story
  navigateTo('opening-story-1');
}

// Handle post-survey submission
async function handlePostSurveySubmit(e) {
  e.preventDefault();

  const form = e.target;

  // No validation required - all fields are optional

  // Collect form data
  const formData = new FormData(form);
  const data = {
    timestamp: new Date().toISOString(),
    anonymous_code: formData.get('anonymous_code'),
    life_satisfaction: {},
    self_efficacy: {},
    post_traumatic_growth: {},
    learning_engagement: {},
    feedback: ''
  };

  // Process Likert scale questions (Q1-Q52)
  // Q1-Q8: Life Satisfaction
  for (let i = 1; i <= 8; i++) {
    data.life_satisfaction[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  // Q9-Q22: Self-Efficacy
  for (let i = 9; i <= 22; i++) {
    data.self_efficacy[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  // Q23-Q36: Post-Traumatic Growth
  for (let i = 23; i <= 36; i++) {
    data.post_traumatic_growth[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  // Q37-Q52: Learning Engagement
  for (let i = 37; i <= 52; i++) {
    data.learning_engagement[`q${i}`] = parseInt(formData.get(`q${i}`));
  }

  // Q53: Open-ended feedback
  data.feedback = formData.get('q53') || '';

  // Store data
  surveyData.postSurvey = data;

  // Send to Google Sheets
  showNotification('Sending data to Google Sheets...', 'info');
  const success = await sendToGoogleSheets();

  if (success) {
    showNotification('Data saved successfully!', 'success');
  } else {
    showNotification('Data sent (check console for details)', 'info');
  }

  // Navigate to completion
  setTimeout(() => {
    navigateTo('completion');
  }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Send game data to Google Sheets
async function sendGameData() {
  // Prepare data object
  const gameData = {
    timestamp: new Date().toISOString(),
    student_id: surveyData.studentInfo?.id || '',
    student_name: surveyData.studentInfo?.name || '',

    // Stage 1 Data
    stage1_cards: JSON.stringify(surveyData.gamePlay?.stage1?.cards || []),

    // Stage 2 Data
    stage2_stories: JSON.stringify(surveyData.gamePlay?.stage2?.selectedCards || []),

    // Stage 3 Data
    stage3_mode: surveyData.gamePlay?.stage3?.mode || '',
    stage3_rolls: JSON.stringify(surveyData.gamePlay?.stage3?.rolls || []),
    stage3_remaining: JSON.stringify(surveyData.gamePlay?.stage3?.remainingCards || []),
    stage3_lost: JSON.stringify(surveyData.gamePlay?.stage3?.lostCards || []),

    // Interim Message
    interim_message: surveyData.gamePlay?.interimMessage || ''
  };

  // Send to Google Sheets
  try {
    console.log('Sending game data:', gameData);

    // Use URLSearchParams to send data as query parameters (GET request) or body (POST)
    // Since we are using no-cors, we can't read the response, but we can send data.
    // Ideally, we should use POST with text/plain to avoid CORS preflight issues if possible,
    // or just rely on the script to handle the POST data.

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(gameData)
    });

    console.log('Data sent to Google Sheets.');
    return true;
  } catch (error) {
    console.error('Error sending data:', error);
    throw error;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSurveys);