# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import docx2txt
import re
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Import custom modules
import ner_module        # NER logic (e.g., ner_ml_rule)
import cleaning_module   # Cleaning functions (e.g., clean_text_with_groq)
from recommendation import get_recommendations  # Updated to return course objects with links

# Load environment variables and configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ATS scoring prompt for Gemini
ats_prompt = """
Analyze this resume and job description to provide these 6 scores:
1. ATS Score: Match between resume and job description (0-100%)
2. Readability: Resume clarity and structure (0-100%)
3. Grammar: Spelling and grammar correctness (0-100%)
4. Keywords: Industry-specific keyword usage (0-100%)
5. Experience: Relevance of experience (0-100%)
6. Customization: Tailoring to this specific job (0-100%)

Format response ONLY as comma-separated numbers:
ATS,Readability,Grammar,Keywords,Experience,Customization
"""

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    """
    Accepts:
      - "file": resume file (PDF, DOCX, or TXT)
      - "job_desc": job description string
    Processes the resume to extract and clean skills. If job_desc is provided,
    generates ATS scores and course recommendations.
    Returns JSON:
      - "cleanedSkills": string of cleaned skills,
      - "ats_scores": dictionary with ATS metrics,
      - "recommendedCourses": dictionary mapping missing skills to course objects.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    resume_file = request.files["file"]
    job_desc = request.form.get("job_desc", "").strip()

    file_type = resume_file.content_type
    resume_text = ""
    if file_type == "application/pdf":
        with pdfplumber.open(resume_file) as pdf:
            resume_text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        resume_text = docx2txt.process(resume_file)
    else:
        resume_text = resume_file.read().decode("utf-8", errors="ignore")

    # Run NER extraction; assume result[7] holds raw skills.
    result = ner_module.ner_ml_rule(resume_file.filename, resume_text)
    raw_skills = result[7]
    raw_skills_text = ", ".join(raw_skills)
    cleaned_skills_text = cleaning_module.clean_text_with_groq(raw_skills_text)

    ats_scores = {}
    recommended_courses = {}

    if job_desc:
        # Get recommendations using the updated recommendation module.
        missing_skills, recs = get_recommendations(job_desc, cleaned_skills_text)
        recommended_courses = recs

        # Use Gemini to generate ATS scores.
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([ats_prompt, resume_text, job_desc])
        scores = re.findall(r"\d+", response.text)
        if len(scores) == 6:
            ats_scores = {
                "ATS Score": f"{scores[0]}%",
                "Readability": f"{scores[1]}%",
                "Grammar": f"{scores[2]}%",
                "Keywords": f"{scores[3]}%",
                "Experience": f"{scores[4]}%",
                "Customization": f"{scores[5]}%"
            }
        else:
            ats_scores = {"error": "Failed to generate ATS scores"}

    return jsonify({
        "cleanedSkills": cleaned_skills_text,
        "ats_scores": ats_scores,
        "recommendedCourses": recommended_courses
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)