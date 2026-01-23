/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../js/participant.js');

describe('Participant Logic', () => {
  beforeAll(() => {
    // Load participant.js
    if (fs.existsSync(scriptPath)) {
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        window.eval(scriptContent);
    }
  });

  beforeEach(() => {
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Mock renderAttributeInput (global)
    window.renderAttributeInput = jest.fn((container) => {
        container.innerHTML = '<button id="saveAndProceed">Save</button><input id="anonymousCode" value="TEST"><select id="gender"><option value="male" selected>Male</option></select><input id="age" value="20">';
    });

    // Mock alert
    window.alert = jest.fn();
  });

  test('requireParticipantOrInput should execute callback if participant exists', () => {
    // Setup existing participant
    sessionStorage.setItem('participant', JSON.stringify({
        anonymousCode: 'EXISTING', gender: 'male', age: 20
    }));

    const callback = jest.fn();
    const container = document.createElement('div');
    
    // Call the function we are about to implement
    if (typeof requireParticipantOrInput === 'function') {
        requireParticipantOrInput(container, callback);
    } else {
        throw new Error('requireParticipantOrInput not defined');
    }

    expect(callback).toHaveBeenCalled();
    expect(window.renderAttributeInput).not.toHaveBeenCalled();
  });

  test('requireParticipantOrInput should render form if participant missing', () => {
    const callback = jest.fn();
    const container = document.createElement('div');

    if (typeof requireParticipantOrInput === 'function') {
        requireParticipantOrInput(container, callback);
    }

    expect(window.renderAttributeInput).toHaveBeenCalledWith(container);
    expect(callback).not.toHaveBeenCalled();
  });

  test('requireParticipantOrInput should save and callback on form submit', () => {
     const callback = jest.fn();
     const container = document.createElement('div');
 
     requireParticipantOrInput(container, callback);
     
     // Simulate click
     const btn = container.querySelector('#saveAndProceed');
     btn.click();
     
     // Check save
     const saved = JSON.parse(sessionStorage.getItem('participant'));
     expect(saved).not.toBeNull();
     expect(saved.anonymousCode).toBe('TEST');
     
     expect(callback).toHaveBeenCalled();
  });
});
