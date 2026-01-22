# Initial Concept
# Product Definition - Dice of Destiny (Ver2/Ver3)

## Initial Concept
Dice of Destiny is a research-oriented web application consisting of a game and related psychological surveys. The project aims to transition from a monolithic structure to a modular design (Ver2) and eventually a unified, integrated experience (Ver3).

## Target Users
- **Students and academic researchers:** Participating in research studies as players and survey respondents.
- **Internal team:** Researchers and administrators who manage the project and analyze the collected data.

## Key Goals
- **Data Collection Excellence:** Ensure seamless and robust data collection into a centralized Google Spreadsheet using Google Apps Script.
- **Enhanced User Experience:** Significantly improve the visual design and overall player experience of the "Dice of Destiny" game component.

## Functional Features
- **Standalone Game Experience:** A fully functional, standalone version of the "Dice of Destiny" game.
 - **Unified Integrated Flow (Ver3):** A central landing page that captures demographic information once and orchestrates the transition between surveys and the game.
- **Distributed Participant Input (Ver3):** Participant demographic information (anonymous code, gender, age) is now collected dynamically within each content page (pre-survey, game, post-survey) as needed, rather than solely on a central landing page. The central landing page (`index.html`) now serves purely as a navigation hub.- **Automated Data Integration:** Reliable, automated submission of all user-generated data to a backend Google Spreadsheet.

## Non-Functional Requirements
- **Data Integrity:** Guarantee that participant demographic information is consistently and accurately linked to their specific game and survey responses.
- **Maintainability:** Utilize clean, well-documented Vanilla JavaScript and CSS variables to ensure the codebase is easy to understand and maintain for future researchers.

## Success Metrics
- **Data Reliability:** Zero data loss or attribution errors during participant sessions.
- **User Engagement & Quality:** High participant satisfaction and positive feedback regarding the improved visual and interactive elements of the game.
