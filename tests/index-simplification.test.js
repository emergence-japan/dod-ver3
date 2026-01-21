/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

describe('index.html Simplification', () => {
    let htmlContent;
    
    beforeAll(() => {
        htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    });

    test('should not contain input fields', () => {
        document.body.innerHTML = htmlContent;
        // inputs should be removed
        expect(document.querySelector('#anonymousCode')).toBeNull();
        expect(document.querySelector('#gender')).toBeNull();
        expect(document.querySelector('#age')).toBeNull();
    });

    test('should contain navigation buttons', () => {
        document.body.innerHTML = htmlContent;
        expect(document.getElementById('goToPreSurvey')).not.toBeNull();
        expect(document.getElementById('goToGame')).not.toBeNull();
        expect(document.getElementById('goToPostSurvey')).not.toBeNull();
    });
});
