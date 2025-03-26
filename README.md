# PlacementPilot

PlacementPilot is a comprehensive, multi-feature application designed to empower candidates during their placement journey. The project is organized into three main features:

1. **Resume Analysis and Recommendations** 
2. **Gamified Tic Tac Toe**
3. **Interactive Community Platform for Interview Feedback**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [1. Resume Analysis and Recommendations](#1-resume-analysis-and-recommendations)
  - [2. Gamified Tic Tac Toe](#2-gamified-tic-tac-toe)
  - [3. Interactive Community Platform](#3-interactive-community-platform)
- [Repository Structure](#repository-structure)
- [Setup and Installation](#setup-and-installation)
  - [Backend Environment](#backend-environment)
  - [Frontend Environment](#frontend-environment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
## Overview

PlacementPilot integrates intelligent resume processing with community support and gamification. It aims to:

- **Analyze Resumes:** Extract and clean data from resumes to provide ATS (Applicant Tracking System) scores and course recommendations.

- **Engage Candidates:** Add an element of fun through a Tic Tac Toe game that incorporates quiz rounds before moves are allowed.

- **Empower Community Feedback:** Build an interactive platform where candidates can share and read interview experiences, fostering peer-to-peer learning.
## Features

### 1. Resume Analysis and Recommendations

**Location:** `backend/flask_app/`

#### Key Files:
- **`app.py`**: Main Flask application exposing the `/analyze` endpoint.
- **`ner_module.py`**: Combines machine learning and rule-based NER (Named Entity Recognition) to extract key data (names, skills, contact info, etc.).
- **`cleaning_module.py`**: Cleans and normalizes extracted text and skills.
- **`recommendation.py`**: Uses TF-IDF, cosine similarity, and the YouTube Data API to analyze job descriptions, identify missing skills, and recommend relevant online courses.
- **Additional supporting files:** `api.txt`, `company.txt`, `job-titles.txt`, `skill_set.txt`, `test.py`, and `webscrap.py`.

#### Functionality:
- **Resume Parsing:** Accepts resume files in PDF, DOCX, or TXT formats.
- **NER Extraction:** Uses spaCy, NLTK, and custom regex rules to extract details such as name, mobile number, email, education, and skills.
- **ATS Scoring:** Utilizes Google’s generative AI (Gemini) to produce scores on ATS match, readability, grammar, keywords, experience, and customization based on a provided job description.
- **Course Recommendations:** Identifies skill gaps by comparing the resume’s skills with the job description and suggests online courses via the YouTube API.

#### Environment Requirements:
- **Environment variables** (stored in a `.env` file) for `GOOGLE_API_KEY` and `API_KEY` (for YouTube Data API).
- **Python dependencies:** `Flask`, `flask-cors`, `pdfplumber`, `docx2txt`, `nltk`, `spacy`, `pandas`, `scikit-learn`, `requests`, `python-dotenv`, `google-generativeai`, etc.

### 2. Gamified Tic Tac Toe

**Location:** `backend/server.js`

#### Key Files:
- **`server.js`**: Implements the real-time game server using Node.js, Express, and Socket.io.
- **`/data/questions.json`**: Contains a question bank for quiz rounds.

#### Functionality:
- **Real-Time Gameplay:**  
  Players connect via Socket.io and are paired together.

- **Quiz-Integrated Moves:**  
  Before making a Tic Tac Toe move, both players receive a quiz question (randomly selected from the question bank).

- **Answering Correctly:**  
  Grants the player the right to make a move.

- **Timing:**  
  Each question round has a 30-second time limit. If no correct answer is submitted within that period, both players are notified, and a new round begins.

#### Game Logic:
- **State Management:**  
  Maintains game state (board, player information, and timers) in memory.
  
- **Win/Draw Checks:**  
  Uses a dedicated `checkWinner` function to determine winning conditions or draws.

- **Real-Time Updates:**  
  Handles updates and disconnections gracefully to ensure smooth gameplay.

#### Database Integration:
- **MongoDB Connection:**  
  Connects to MongoDB via Mongoose (configured in `server.js`) for additional persistence, which can be used for logging game sessions or player statistics.

### 3. Interactive Community Platform

**Location:** `backend/routes/reviewRoute.js` (with supporting model in `backend/models/Review.js`)

#### Key Files:
- **`reviewRoute.js`**: Provides RESTful API endpoints for creating, reading, deleting, and replying to interview experience reviews.
- **`models/Review.js`**: Defines the data schema for reviews (supports storing review text, user details, and replies).

#### Functionality:
- **Review Submission:**
  - **POST `/api/experiences`**: Users can submit their interview experience reviews.
- **Review Retrieval:**
  - **GET `/api/experiences`**: Fetches all reviews to display on the community platform.
- **Review Deletion:**
  - **DELETE `/api/experiences/:id`**: Removes a specific review.
- **Reply Management:**
  - **POST `/api/experiences/:id/replies`**: Allows users to add replies to a review.
  - **DELETE `/api/experiences/:reviewId/replies/:replyId`**: Enables deletion of specific replies.
- **Community Engagement:**  
  Facilitates interactive discussions and feedback on interview experiences, enabling candidates to learn from each other’s insights.

#### Environment Requirements:
- **Node.js Dependencies:** Express, Mongoose, and other middleware.
- **Database:** A MongoDB instance (configured via an environment variable `MONGO_URI`).
## Setup and Installation

### Backend Environment

#### Clone the Repository:
```bash
git clone https://github.com/Sreyash-Rout/PlacementPilot.git
cd PlacementPilot
```
#### Set Up Environment Variables:
Create a `.env` file in the appropriate directories (e.g., for the Flask app and Node.js server) with the following keys:
```ini
GOOGLE_API_KEY=your_google_api_key_here
API_KEY=your_youtube_api_key_here
MONGO_URI=your_mongodb_connection_string
```
#### Install Dependencies:

- **For the Flask App:**

    ```bash
    cd backend/flask_app
    pip install -r requirements.txt
    ```
    *If a requirements file is not provided, install the following packages manually:*

    ```bash
    pip install Flask flask-cors pdfplumber docx2txt nltk spacy pandas scikit-learn requests python-dotenv google-generativeai
    ```
 - **For the Node.js Server:**
    ```bash
    cd ../../backend
    npm install
    ```
### Frontend Environment
#### Set Up the Frontend:
Navigate to the React app directory and install dependencies:
```bash
cd frontend/placementpilot_frontend
npm install
```
#### Run the React Development Server:
```bash
npm start
```
Open http://localhost:3000 in your browser.





## Usage

### Running the Resume Analysis Engine

From the `backend/flask_app/` directory, start the Flask server:

```bash
python app.py
```
Send a **POST** request to `http://localhost:5000/analyze` with form-data:
- **file:** Upload a resume file (PDF, DOCX, or TXT).
- **job_desc:** *(Optional)* Include a job description for ATS scoring and recommendations.

---

### Playing the Gamified Tic Tac Toe

Start the Node.js server (from the `backend/` directory):

```bash
node server.js
```
Connect to the server via a Socket.io-enabled client. Players will be paired, receive quiz questions before making moves, and the game logic will enforce time limits and check for wins/draws.
## Contributing

Contributions are welcome! To contribute:

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix.
3. **Commit your changes** with clear messages.
4. **Push your branch** and create a pull request with a detailed description of your changes.
## License

This project is licensed under the [MIT License](LICENSE).
