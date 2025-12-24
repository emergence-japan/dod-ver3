// app.js - 修正版

// Global state
let currentSection = 'welcome';

// グローバルなsurveyDataを一元管理（重要: survey.jsとの重複を避ける）
if (typeof window.surveyData === 'undefined') {
  window.surveyData = {
    preSurvey: {},
    gamePlay: {
      stage1: null,
      stage2: null,
      stage3: null,
      interimMessage: ''
    },
    postSurvey: {}
  };
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Show welcome screen
  showSection('welcome');

  // Add fade-in animation to welcome screen
  const welcomeSection = document.getElementById('welcome');
  if (welcomeSection) {
    welcomeSection.classList.add('fade-in');
  }

  // Warning on page refresh
  window.addEventListener('beforeunload', (e) => {
    if (currentSection !== 'welcome' && currentSection !== 'completion') {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
    }
  });
}

function navigateTo(sectionId) {
  // Hide current section
  const currentSectionEl = document.getElementById(currentSection);
  if (currentSectionEl) {
    currentSectionEl.classList.remove('active');
    currentSectionEl.classList.add('fade-out');
  }

  // Show new section after short delay
  setTimeout(() => {
    if (currentSectionEl) {
      currentSectionEl.classList.remove('fade-out');
    }

    const newSection = document.getElementById(sectionId);
    if (newSection) {
      newSection.classList.add('active', 'fade-in');
      newSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      currentSection = sectionId;

      // Remove fade-in class after animation
      setTimeout(() => {
        newSection.classList.remove('fade-in');
      }, 500);
    }
  }, 300);
}

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.screen').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    currentSection = sectionId;
  }
}

async function completeGameAndSend() {
  // Show loading state
  const button = document.querySelector('#ending-story .btn-primary');
  if (button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending Data...';

    try {
      // payloadにはゲームの全データを含める
      const gamePayload = window.surveyData.gamePlay;

      // 重要: データが存在するか確認
      if (!gamePayload.stage1 || !gamePayload.stage2 || !gamePayload.stage3) {
        throw new Error('ゲームデータが不完全です。');
      }

      // Send data using the new common submission function
      const success = await submitToGAS({ page: 'game', payload: gamePayload });

      if (success) {
        // Navigate to completion screen
        navigateTo('completion');
      } else {
        throw new Error('Submission to GAS failed.');
      }

    } catch (error) {
      console.error('Failed to send data:', error);
      alert(`データの送信に失敗しました。
エラー: ${error.message}
もう一度お試しください。`);
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

// ========================================
// STAGE 1: Creating Precious Thing Cards
// ========================================

const categoryMap = {
  items: "モノ",
  person: "人",
  places: "場所",
  events: "出来事",
  goals: "目標"
};

let stage1Data = {
  startTime: null,
  endTime: null,
  cards: []
};

// Initialize Stage 1
function initializeStage1() {
  stage1Data.startTime = new Date().toISOString();

  // Add input listeners to all card inputs
  const cardInputs = document.querySelectorAll('.card-input');
  cardInputs.forEach(input => {
    input.addEventListener('input', handleCardInput);
  });

  // Initial validation
  validateStage1();
}

// Handle card input changes
function handleCardInput(e) {
  const input = e.target;
  const cardSlot = input.closest('.card-slot');
  const value = input.value.trim();

  // Update visual state
  if (value !== '') {
    cardSlot.classList.add('filled');
  } else {
    cardSlot.classList.remove('filled');
  }

  // Validate
  validateStage1();
}

// Validate Stage 1 requirements
function validateStage1() {
  const cardInputs = document.querySelectorAll('.card-input');
  const categories = {
    items: 0,
    person: 0,
    places: 0,
    events: 0,
    goals: 0
  };
  let totalCards = 0;

  // Count filled cards by category
  cardInputs.forEach(input => {
    if (input.value.trim() !== '') {
      const category = input.closest('.card-column').dataset.category;
      categories[category]++;
      totalCards++;
    }
  });

  // Update counts in UI
  document.getElementById('total-cards-count').textContent = `${totalCards} / 25`;
  document.getElementById('items-count').textContent = categories.items;
  document.getElementById('person-count').textContent = categories.person;
  document.getElementById('places-count').textContent = categories.places;
  document.getElementById('events-count').textContent = categories.events;
  document.getElementById('goals-count').textContent = categories.goals;

  // Validate requirements
  const totalValid = totalCards >= 5 && totalCards <= 25;
  const itemsValid = categories.items >= 1;
  const personValid = categories.person >= 1;
  const placesValid = categories.places >= 1;
  const eventsValid = categories.events >= 1;
  const goalsValid = categories.goals >= 1;

  // Update status indicators
  updateValidationStatus('total-cards-status', totalValid,
    totalValid ? '✓ Valid' : '⚠️ Need 5-25 cards');
  updateValidationStatus('items-status', itemsValid,
    itemsValid ? '✓' : '⚠️ Need at least 1');
  updateValidationStatus('person-status', personValid,
    personValid ? '✓' : '⚠️ Need at least 1');
  updateValidationStatus('places-status', placesValid,
    placesValid ? '✓' : '⚠️ Need at least 1');
  updateValidationStatus('events-status', eventsValid,
    eventsValid ? '✓' : '⚠️ Need at least 1');
  updateValidationStatus('goals-status', goalsValid,
    goalsValid ? '✓' : '⚠️ Need at least 1');

  // Enable/disable next button
  const allValid = totalValid && itemsValid && personValid &&
    placesValid && eventsValid && goalsValid;
  document.getElementById('stage1-next').disabled = !allValid;

  return allValid;
}

// Update validation status element
function updateValidationStatus(elementId, isValid, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
    element.className = 'validation-status ' + (isValid ? 'valid' : 'invalid');
  }
}

// Complete Stage 1 and move to Stage 2
function completeStage1() {
  if (!validateStage1()) {
    showNotification('Please complete all requirements before proceeding', 'error');
    return;
  }

  // Collect all card data
  const cardInputs = document.querySelectorAll('.card-input');
  stage1Data.cards = [];

  cardInputs.forEach(input => {
    const cardSlot = input.closest('.card-slot');
    const category = cardSlot.dataset.category;
    const position = parseInt(cardSlot.dataset.position);
    const text = input.value.trim();

    stage1Data.cards.push({
      id: input.dataset.cardId,
      category: category,
      position: position,
      text: text
    });
  });

  stage1Data.endTime = new Date().toISOString();

  // Store in global surveyData
  window.surveyData.gamePlay.stage1 = stage1Data;

  // Navigate to Stage 2
  navigateTo('stage2');

  // Initialize Stage 2 with cards from Stage 1
  setTimeout(() => initializeStage2(), 500);
}

// Initialize on section display
document.addEventListener('DOMContentLoaded', () => {
  // Initialize when stage1 becomes active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.id === 'stage1' && mutation.target.classList.contains('active')) {
        initializeStage1();
      }
    });
  });

  const stage1 = document.getElementById('stage1');
  if (stage1) {
    observer.observe(stage1, { attributes: true, attributeFilter: ['class'] });
  }
});

// ========================================
// STAGE 2: Writing Stories
// ========================================

let stage2Data = {
  startTime: null,
  endTime: null,
  selectedCards: []
};

function initializeStage2() {
  stage2Data.startTime = new Date().toISOString();

  // Get cards from Stage 1
  if (!window.surveyData.gamePlay.stage1) {
    console.error('Stage 1 data not found!');
    return;
  }

  const cards = window.surveyData.gamePlay.stage1.cards.filter(card => card.text !== '');

  // Display cards for selection
  const cardListEl = document.getElementById('stage2-cards');
  if (!cardListEl) return;
  
  cardListEl.innerHTML = '';

  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'selectable-card';
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.category = card.category;
    cardEl.innerHTML = `
      <div class="card-category ${card.category}">${categoryMap[card.category] || card.category}</div>
      <div class="card-text">${card.text}</div>
    `;

    cardEl.addEventListener('click', () => toggleCardSelection(cardEl, card));
    cardListEl.appendChild(cardEl);
  });
}

function toggleCardSelection(cardEl, card) {
  cardEl.classList.toggle('selected');

  if (cardEl.classList.contains('selected')) {
    addStoryInput(card);
  } else {
    removeStoryInput(card.id);
  }

  validateStage2();
}

function addStoryInput(card) {
  const storyArea = document.getElementById('story-input-area');
  if (!storyArea) return;

  const storyBox = document.createElement('div');
  storyBox.className = 'story-box';
  storyBox.id = `story-${card.id}`;
  storyBox.innerHTML = `
    <h4>物語: "${card.text}" (${categoryMap[card.category] || card.category})</h4>
    <textarea 
      class="story-textarea" 
      data-card-id="${card.id}"
      placeholder="ここに物語を書いてください..."
      rows="6"
    ></textarea>
  `;

  storyArea.appendChild(storyBox);

  // Add listener
  const textarea = storyBox.querySelector('textarea');
  textarea.addEventListener('input', validateStage2);
}

function removeStoryInput(cardId) {
  const storyBox = document.getElementById(`story-${cardId}`);
  if (storyBox) {
    storyBox.remove();
  }
}

function validateStage2() {
  const textareas = document.querySelectorAll('.story-textarea');
  let storiesWritten = 0;

  textareas.forEach(textarea => {
    if (textarea.value.trim() !== '') {
      storiesWritten++;
    }
  });

  const countEl = document.getElementById('story-count');
  if (countEl) {
    countEl.textContent = storiesWritten;
  }

  const valid = storiesWritten >= 1;
  const nextBtn = document.getElementById('stage2-next');
  if (nextBtn) {
    nextBtn.disabled = !valid;
  }

  return valid;
}

function completeStage2() {
  if (!validateStage2()) {
    showNotification('Please write at least one story', 'error');
    return;
  }

  // Collect story data
  const textareas = document.querySelectorAll('.story-textarea');
  stage2Data.selectedCards = [];

  textareas.forEach(textarea => {
    const story = textarea.value.trim();
    if (story !== '') {
      const cardId = textarea.dataset.cardId;
      const card = window.surveyData.gamePlay.stage1.cards.find(c => c.id === cardId);

      if (card) {
        stage2Data.selectedCards.push({
          cardId: cardId,
          cardText: card.text,
          category: card.category,
          story: story
        });
      }
    }
  });

  stage2Data.endTime = new Date().toISOString();
  window.surveyData.gamePlay.stage2 = stage2Data;

  // Navigate to Stage 3
  navigateTo('stage3');
}

// ========================================
// STAGE 3: Roll the Dice of Destiny
// ========================================

let stage3Data = {
  startTime: null,
  endTime: null,
  mode: null,
  rolls: [],
  remainingCards: [],
  lostCards: []
};

function selectDifficulty(mode) {
  stage3Data.mode = mode;
  stage3Data.startTime = new Date().toISOString();

  // Hide difficulty selection
  const difficultySelection = document.getElementById('difficulty-selection');
  if (difficultySelection) {
    difficultySelection.style.display = 'none';
  }

  // Show game interface
  const gameInterface = document.getElementById('game-interface');
  if (gameInterface) {
    gameInterface.style.display = 'block';
  }

  const displayModeMap = {
    'STANDARD': 'スタンダード',
    'HARD': 'ハード'
  };
  
  const modeDisplay = document.getElementById('difficulty-display');
  if (modeDisplay) {
    modeDisplay.textContent = displayModeMap[mode] || mode;
  }

  // Initialize cards
  initializeStage3Cards();
}

function initializeStage3Cards() {
  // Get all filled cards from Stage 1
  if (!window.surveyData.gamePlay.stage1) {
    console.error('Stage 1 data not found!');
    return;
  }

  const allCards = window.surveyData.gamePlay.stage1.cards.filter(c => c.text !== '');
  stage3Data.remainingCards = [...allCards];
  stage3Data.lostCards = [];

  displayCards();
}

function displayCards() {
  // Display remaining cards
  const remainingList = document.getElementById('remaining-cards-list');
  if (remainingList) {
    remainingList.innerHTML = '';

    stage3Data.remainingCards.forEach(card => {
      const cardEl = createGameCard(card, 'remaining');
      remainingList.appendChild(cardEl);
    });
  }

  const remainingCount = document.getElementById('remaining-count');
  if (remainingCount) {
    remainingCount.textContent = stage3Data.remainingCards.length;
  }

  // Display lost cards
  const lostList = document.getElementById('lost-cards-list');
  if (lostList) {
    lostList.innerHTML = '';

    stage3Data.lostCards.forEach(card => {
      const cardEl = createGameCard(card, 'lost');
      lostList.appendChild(cardEl);
    });
  }

  const lostCount = document.getElementById('lost-count');
  if (lostCount) {
    lostCount.textContent = stage3Data.lostCards.length;
  }
}

function createGameCard(card, type) {
  const cardEl = document.createElement('div');
  cardEl.className = `game-card ${type}`;
  cardEl.dataset.cardId = card.id;
  cardEl.innerHTML = `
    <div class="card-category ${card.category}">${categoryMap[card.category] || card.category}</div>
    <div class="card-text">${card.text}</div>
  `;

  if (type === 'remaining') {
    cardEl.addEventListener('click', () => toggleCardForLoss(cardEl));
  }

  return cardEl;
}

function rollDice() {
  // Disable roll button
  const rollBtn = document.getElementById('roll-button');
  if (rollBtn) {
    rollBtn.disabled = true;
  }

  // Animate dice
  const dice = document.getElementById('dice');
  if (dice) {
    dice.classList.add('rolling');

    // Random result after animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      const diceFace = dice.querySelector('.dice-face');
      if (diceFace) {
        diceFace.textContent = result;
      }
      dice.classList.remove('rolling');

      processRollResult(result);
    }, 1000);
  }
}

function processRollResult(diceResult) {
  const mode = stage3Data.mode;
  const cardsToLose = mode === 'STANDARD' ? diceResult : diceResult + 2;
  const remainingCount = stage3Data.remainingCards.length;

  const actualCardsToLose = Math.min(cardsToLose, remainingCount);

  // Show result
  const diceResultEl = document.getElementById('dice-result');
  if (diceResultEl) {
    diceResultEl.textContent = `You rolled ${diceResult}. You must lose ${actualCardsToLose} card(s).`;
  }

  // Show selection prompt
  const cardsToLoseEl = document.getElementById('cards-to-lose');
  if (cardsToLoseEl) {
    cardsToLoseEl.textContent = actualCardsToLose;
  }

  const selectionPrompt = document.getElementById('selection-prompt');
  if (selectionPrompt) {
    selectionPrompt.style.display = 'block';
  }

  // Store for confirmation
  stage3Data.currentRoll = {
    rollNumber: stage3Data.rolls.length + 1,
    diceResult: diceResult,
    cardsToLose: actualCardsToLose
  };
}

function toggleCardForLoss(cardEl) {
  cardEl.classList.toggle('selected');
  validateSelection();
}

function validateSelection() {
  const selected = document.querySelectorAll('.game-card.selected');
  const required = stage3Data.currentRoll ? stage3Data.currentRoll.cardsToLose : 0;

  const confirmBtn = document.getElementById('confirm-selection');
  if (confirmBtn) {
    confirmBtn.disabled = selected.length !== required;
  }
}

function confirmSelection() {
  const selectedCards = document.querySelectorAll('.game-card.selected');
  const lostCardIds = Array.from(selectedCards).map(el => el.dataset.cardId);

  // Move cards from remaining to lost
  lostCardIds.forEach(cardId => {
    const cardIndex = stage3Data.remainingCards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
      const card = stage3Data.remainingCards.splice(cardIndex, 1)[0];
      stage3Data.lostCards.push(card);
    }
  });

  // Store roll data
  if (stage3Data.currentRoll) {
    stage3Data.currentRoll.cardsLost = lostCardIds;
    stage3Data.rolls.push(stage3Data.currentRoll);
  }

  // Update display
  displayCards();

  // Hide selection prompt
  const selectionPrompt = document.getElementById('selection-prompt');
  if (selectionPrompt) {
    selectionPrompt.style.display = 'none';
  }

  // Check if game should continue
  const rollCount = stage3Data.rolls.length;

  if (stage3Data.remainingCards.length === 0) {
    // All cards lost - end game
    finishGame();
  } else if (rollCount >= 4) {
    // Show continue or finish options
    const continueOrFinish = document.getElementById('continue-or-finish');
    if (continueOrFinish) {
      continueOrFinish.style.display = 'block';
    }
  } else {
    // Continue rolling (required 4 rolls minimum)
    const rollBtn = document.getElementById('roll-button');
    if (rollBtn) {
      rollBtn.disabled = false;
    }
    
    const rollNumber = document.getElementById('roll-number');
    if (rollNumber) {
      rollNumber.textContent = rollCount + 1;
    }
  }
}

function continueRolling() {
  const continueOrFinish = document.getElementById('continue-or-finish');
  if (continueOrFinish) {
    continueOrFinish.style.display = 'none';
  }

  const rollBtn = document.getElementById('roll-button');
  if (rollBtn) {
    rollBtn.disabled = false;
  }

  const rollNumber = document.getElementById('roll-number');
  if (rollNumber) {
    rollNumber.textContent = stage3Data.rolls.length + 1;
  }
}

function finishGame() {
  stage3Data.endTime = new Date().toISOString();
  window.surveyData.gamePlay.stage3 = stage3Data;

  // Navigate to interim story
  navigateTo('interim-story');

  // Display cards after a short delay to ensure page is loaded
  setTimeout(() => {
    displayInterimCards();
  }, 500);
}

function displayInterimCards() {
  // Display remaining cards
  const remainingContainer = document.getElementById('interim-remaining-cards');
  const remainingCountEl = document.getElementById('interim-remaining-count');

  if (remainingContainer && remainingCountEl) {
    remainingContainer.innerHTML = '';
    remainingCountEl.textContent = stage3Data.remainingCards.length;

    stage3Data.remainingCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `interim-card ${card.category}`;
      cardEl.innerHTML = `
        <div class="card-category">${categoryMap[card.category] || card.category}</div>
        <div class="card-text">${card.text}</div>
      `;
      remainingContainer.appendChild(cardEl);
    });
  }

  // Display lost cards
  const lostContainer = document.getElementById('interim-lost-cards');
  const lostCountEl = document.getElementById('interim-lost-count');

  if (lostContainer && lostCountEl) {
    lostContainer.innerHTML = '';
    lostCountEl.textContent = stage3Data.lostCards.length;

    stage3Data.lostCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `interim-card ${card.category} lost`;
      cardEl.innerHTML = `
        <div class="card-category">${categoryMap[card.category] || card.category}</div>
        <div class="card-text">${card.text}</div>
      `;
      lostContainer.appendChild(cardEl);
    });
  }
}

function saveInterimMessageAndContinue() {
  const messageTextarea = document.getElementById('interim-message');

  // Store the interim message in surveyData (even if empty)
  window.surveyData.gamePlay.interimMessage = messageTextarea ? messageTextarea.value.trim() : '';

  // Navigate to ending story
  navigateTo('ending-story');
}

// Notification system (survey.jsと同じ)
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
