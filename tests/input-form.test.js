/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the script to be tested (we will create this file next)
const scriptPath = path.resolve(__dirname, '../js/input-form.js');

describe('Attribute Input Form', () => {
  beforeAll(() => {
    // Mock the localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    jest.resetModules();
    
    // We expect the script to define a global function 'renderAttributeInput'
    // Since we can't easily import a non-module file, we'll eval it or assume it's loaded.
    // Ideally, for testing, we might want to expose it. 
    // For now, let's assume we read and eval it.
    if (fs.existsSync(scriptPath)) {
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        // Execute script in global scope
        window.eval(scriptContent);
    }
  });

  test('renderAttributeInput should inject form fields into the container', () => {
    const container = document.createElement('div');
    container.id = 'form-container';
    document.body.appendChild(container);

    // This function doesn't exist yet, so this test will fail (or error out)
    if (typeof renderAttributeInput === 'function') {
        renderAttributeInput(container);
    } else {
        throw new Error('renderAttributeInput is not defined');
    }

    // Check for specific elements
    expect(container.querySelector('input[name="anonymousCode"]')).not.toBeNull();
    expect(container.querySelector('select[name="gender"]')).not.toBeNull();
    expect(container.querySelector('input[name="age"]')).not.toBeNull();
    expect(container.querySelector('button.btn-primary')).not.toBeNull(); // Save button
  });
  
  test('renderAttributeInput should fill values if provided', () => {
     const container = document.createElement('div');
     // render with initial values
     if (typeof renderAttributeInput === 'function') {
         renderAttributeInput(container, {
             anonymousCode: 'TEST1234',
             gender: 'female',
             age: 30
         });
     }
     
     const codeInput = container.querySelector('input[name="anonymousCode"]');
     const genderSelect = container.querySelector('select[name="gender"]');
     const ageInput = container.querySelector('input[name="age"]');
     
     expect(codeInput.value).toBe('TEST1234');
     expect(genderSelect.value).toBe('female');
     expect(ageInput.value).toBe('30');
  });
});
