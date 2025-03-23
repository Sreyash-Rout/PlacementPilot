# recommendation.py
import pandas as pd
import os
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
from cleaning_module import clean_text_with_groq

# Load environment variables once
load_dotenv()
API_KEY = os.getenv("API_KEY")

# Precompute TF-IDF components during module load
@lru_cache(maxsize=1)
def load_data(filepath="skill_set.csv"):
    """Load and cache role-skill dataset with preprocessing"""
    df = pd.read_csv(filepath)
    df['Skills_Processed'] = df['skills'].str.lower().str.replace(r'[^\w\s]', '', regex=True)
    return df

# Initialize TF-IDF components once
df = load_data()
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['Skills_Processed'])

def recommend_missing_skills(job_description, user_skills):
    """Optimized skill gap analysis using precomputed TF-IDF"""
    # Clean inputs
    cleaned_jd = ' '.join(job_description.lower().split())
    user_skills_lower = [s.strip().lower() for s in user_skills.split(',')]
    
    # Transform job description
    jd_vector = vectorizer.transform([cleaned_jd])
    
    # Find best match
    cosine_sim = cosine_similarity(jd_vector, tfidf_matrix)
    best_match_idx = cosine_sim.argmax()
    
    # Identify missing skills
    required_skills = df.iloc[best_match_idx]['skills'].split(', ')
    return [skill for skill in required_skills if skill.lower() not in user_skills_lower]

def search_courses_batch(skills, max_results=2, timeout=3):
    """Parallel YouTube search with timeout handling.
    Returns for each skill an array of course objects with keys: title, url, duration.
    """
    def fetch_single(skill):
        try:
            # Build a search query for YouTube
            query = f"{skill.strip()} full course computer science" if "course" not in skill.lower() else skill
            url = (
                f"https://www.googleapis.com/youtube/v3/search?"
                f"part=snippet&q={query}&type=video&key={API_KEY}"
                f"&maxResults={max_results}&videoDuration=long"
            )
            response = requests.get(url, timeout=timeout).json()
            # Return an array of objects for each search result.
            return [
                {
                    "title": item['snippet']['title'],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    "duration": "N/A"  # Duration is not returned by the search API; placeholder.
                }
                for item in response.get('items', [])
            ]
        except Exception as e:
            print(f"Error searching {skill}: {str(e)[:50]}")
            return []

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(fetch_single, skills))
        return {skill: course_list for skill, course_list in zip(skills, results) if course_list}

def get_recommendations(job_desc, user_skills):
    """Optimized recommendation pipeline with batch processing"""
    # Get missing skills
    missing_skills = recommend_missing_skills(job_desc, user_skills)
    
    # Batch clean missing skills
    if missing_skills:
        raw_skills = ", ".join(missing_skills)
        cleaned_text = clean_text_with_groq(raw_skills)
        cleaned_skills = [s.strip() for s in cleaned_text.split(",") if s.strip()]
    else:
        return [], {}
    
    # Parallel course search returns a dictionary mapping each skill to course objects.
    recommendations = search_courses_batch(cleaned_skills)
    
    # Filter out empty results
    return cleaned_skills, {k: v for k, v in recommendations.items() if v}