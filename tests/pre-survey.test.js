/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

describe('pre-survey.html Participant Handling', () => {
    let htmlContent;
    
    beforeAll(() => {
        htmlContent = fs.readFileSync(path.resolve(__dirname, '../pre-survey.html'), 'utf8');
    });

    test('should include js/input-form.js script tag', () => {
        document.body.innerHTML = htmlContent;
        const scriptTags = Array.from(document.querySelectorAll('script'));
        const hasInputFormScript = scriptTags.some(s => s.src.includes('js/input-form.js'));
        expect(hasInputFormScript).toBe(true);
    });

    test('should use requireParticipantOrInput instead of redirect', () => {
        expect(htmlContent).toContain('requireParticipantOrInput');
        expect(htmlContent).not.toContain('location.replace(\'index.html\')');
    });
});
