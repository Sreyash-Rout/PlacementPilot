import React, { useState } from "react";
import {
  Trophy,
  Clock,
  Upload,
  FileText,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const Dashboard = () => {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const learningPath = {
    completedModules: 3,
    totalModules: 10,
    currentSkills: ["Python", "Data Analysis", "Machine Learning Basics"],
    recommendedCourses: [
      { title: "Advanced Machine Learning", duration: "8 weeks", match: 95 },
      { title: "Deep Learning Fundamentals", duration: "6 weeks", match: 92 },
      { title: "Neural Networks", duration: "4 weeks", match: 88 },
    ],
    upcomingMilestones: [
      "Complete ML Project",
      "Earn TensorFlow Certification",
      "Build Portfolio Project",
    ],
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setResumeUploaded(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setResumeUploaded(true);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="top-header">
          <h1>Welcome back, User!</h1>
          <div className="user-profile">
            <div className="avatar">JD</div>
          </div>
        </header>

        {!resumeUploaded ? (
          <section className="upload-container">
            <div
              className={`upload-area ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <Upload size={48} />
              </div>
              <h3>Upload Your Resume</h3>
              <p>Drag and drop your resume here or</p>
              <label className="upload-button">
                Browse Files
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
              <p className="file-types">PDF, DOC, DOCX files are supported</p>
            </div>
          </section>
        ) : (
          <div className="success-banner">
            <FileText />
            <span>Resume uploaded successfully! AI is analyzing your profile...</span>
          </div>
        )}

        <div className="dashboard-grid">
          <section className="progress-section">
            <div className="section-header">
              <h2>Learning Progress</h2>
              <span className="badge">30% Complete</span>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: "30%" }}></div>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon modules">
                  <Trophy />
                </div>
                <div className="stat-info">
                  <h3>Modules</h3>
                  <p>
                    {learningPath.completedModules}/{learningPath.totalModules}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon skills">
                  <Trophy />
                </div>
                <div className="stat-info">
                  <h3>Skills</h3>
                  <p>{learningPath.currentSkills.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon hours">
                  <Clock />
                </div>
                <div className="stat-info">
                  <h3>Hours</h3>
                  <p>24</p>
                </div>
              </div>
            </div>
          </section>

          <section className="recommendations-section">
            <h2>Recommended Courses</h2>
            <div className="course-list">
              {learningPath.recommendedCourses.map((course, index) => (
                <div key={index} className="course-card">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p>{course.duration}</p>
                  </div>
                  <div className="course-match">
                    <div className="match-badge">{course.match}% Match</div>
                    <ChevronRight />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="skills-section">
            <h2>Current Skills</h2>
            <div className="skills-grid">
              {learningPath.currentSkills.map((skill, index) => (
                <div key={index} className="skill-card">
                  {skill}
                </div>
              ))}
            </div>
          </section>

          <section className="milestones-section">
            <h2>Upcoming Milestones</h2>
            <div className="milestone-list">
              {learningPath.upcomingMilestones.map((milestone, index) => (
                <div key={index} className="milestone-card">
                  <div className="milestone-marker"></div>
                  <p>{milestone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;