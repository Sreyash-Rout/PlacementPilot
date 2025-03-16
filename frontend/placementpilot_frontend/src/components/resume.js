import React, { useState } from "react";
import { Upload, FileText, ChevronRight } from "lucide-react";
import axios from "axios";
import "./resume.css";
import ReactSpeedometer from "react-d3-speedometer";
import ClipLoader from "react-spinners/ClipLoader"; // Using react-spinners
import Navbar from "./Navbar";
import Footer from "./Footer";

const Dashboard = () => {
  // State variables for resume upload, job description, and file.
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [submittedJobDescription, setSubmittedJobDescription] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Learning path state holds current skills, ATS scores, and recommended courses.
  const [learningPath, setLearningPath] = useState({
    completedModules: 3,
    totalModules: 10,
    currentSkills: [],
    ats_scores: {},
    recommendedCourses: {},
  });

  // Drag-and-drop handlers.
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      await uploadResumeFile(droppedFile);
    }
  };

  // File input handler.
  const handleFileChange = async (e) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await uploadResumeFile(selectedFile);
    }
  };

  // Upload resume file to the "/extract" endpoint to extract cleaned skills.
  const uploadResumeFile = async (file) => {
    setResumeUploaded(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const skillsText = response.data["Skills (Cleaned)"] || "";
      const newSkills = skillsText
        .replace(/\n/g, "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      setLearningPath((prev) => ({ ...prev, currentSkills: newSkills }));
    } catch (error) {
      console.error("Error extracting resume information:", error);
    }
  };

  // Handle job description submission – calls the "/analyze" endpoint.
  const handleJobDescriptionSubmit = async () => {
    if (!jobDescription.trim()) {
      alert("Job Description is required.");
      return;
    }
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }
    setSubmittedJobDescription(jobDescription);
    setLoading(true); // Start loading

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_desc", jobDescription);

    try {
      const response = await axios.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      // Update current skills.
      const skillsText = data.cleanedSkills || "";
      const newSkills = skillsText
        .replace(/\n/g, "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      setLearningPath((prev) => ({
        ...prev,
        currentSkills: newSkills,
        ats_scores: data.ats_scores || {},
        recommendedCourses: data.recommendedCourses || {},
      }));
      setJobDescription("");
    } catch (error) {
      console.error("Error analyzing resume and job description:", error);
      alert("Error analyzing resume. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  // Helper function to convert a percent string (e.g., "85%") to a number.
  const parsePercent = (percentStr) => {
    return parseInt(percentStr.replace("%", ""), 10) || 0;
  };

  return (
    <>
    <Navbar />
    <div className="resume-page">
      <main className="main-content">
        {/* Resume Upload Section */}
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
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </label>
              <p className="file-types">
                PDF, DOC, DOCX, TXT files are supported
              </p>
            </div>
          </section>
        ) : (
          <div className="success-banner">
            <FileText />
            <span>
              Resume uploaded successfully! AI is analyzing your profile...
            </span>
          </div>
        )}

        {/* Job Description Submission Section */}
        <section className="job-description-section">
          <h2>Job Description</h2>
          <div className="input-container">
            <label htmlFor="jobDescription">
              Job Description <span className="required">*</span>
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter detailed job description..."
              rows="4"
            />
          </div>
          <div className="submit-container">
            <button onClick={handleJobDescriptionSubmit}>Submit</button>
            {loading && (
              <div className="spinner-inline">
                <ClipLoader color={"blue"} loading={loading} size={20} />
              </div>
            )}
          </div>
          {submittedJobDescription && (
            <div className="job-description-display">
              <p>
                <strong>Job Description Submitted:</strong>{" "}
                {submittedJobDescription}
              </p>
            </div>
          )}
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* ATS Score Section with multiple meters */}
          <section className="skills-section">
            <h2>Scores</h2>
            <div className="speedometers">
              <div className="speedometer-item">
                <h4>ATS Score</h4>
                <ReactSpeedometer
                  value={parsePercent(learningPath.ats_scores["ATS Score"] || "0%")}
                  minValue={0}
                  maxValue={100}
                  needleColor="red"
                  startColor="red"
                  segments={10}
                  endColor="green"
                  currentValueText={
                    learningPath.ats_scores["ATS Score"] || "0%"
                  }
                  height={200}
                />
              </div>
              <div className="speedometer-item">
                <h4>Readability</h4>
                <ReactSpeedometer
                  value={parsePercent(
                    learningPath.ats_scores["Readability"] || "0%"
                  )}
                  minValue={0}
                  maxValue={100}
                  needleColor="orange"
                  startColor="red"
                  segments={10}
                  endColor="green"
                  currentValueText={
                    learningPath.ats_scores["Readability"] || "0%"
                  }
                  height={200}
                />
              </div>
              <div className="speedometer-item">
                <h4>Keywords</h4>
                <ReactSpeedometer
                  value={parsePercent(
                    learningPath.ats_scores["Keywords"] || "0%"
                  )}
                  minValue={0}
                  maxValue={100}
                  needleColor="blue"
                  startColor="red"
                  segments={10}
                  endColor="green"
                  currentValueText={
                    learningPath.ats_scores["Keywords"] || "0%"
                  }
                  height={200}
                />
              </div>
            </div>
          </section>

          {/* Current Skills Section */}
          <section className="skills-section">
            <h2>Current Skills</h2>
            <div className="skills-grid">
              {learningPath.currentSkills.length > 0 ? (
                learningPath.currentSkills.map((skill, index) => (
                  <div key={index} className="skill-card">
                    {skill}
                  </div>
                ))
              ) : (
                <p>No skills available.</p>
              )}
            </div>
          </section>

          {/* Recommended Courses Section */}
          <section className="recommendations-section">
            <h2>Recommended Courses and Videos</h2>
            <div className="course-list">
              {Object.keys(learningPath.recommendedCourses).length > 0 ? (
                Object.entries(learningPath.recommendedCourses).map(
                  ([skill, courses], idx) => (
                    <div key={idx} className="recommendation-group">
                      <h3>{skill}</h3>
                      {courses.length > 0 ? (
                        courses.map((course, idc) => (
                          <div key={idc} className="course-card">
                            <div className="course-info">
                              <h4>{course.title}</h4>
                            </div>
                            <div className="course-match">
                              {course.url && (
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ChevronRight />
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No courses recommended for this skill.</p>
                      )}
                    </div>
                  )
                )
              ) : (
                <p>No recommended courses available.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default Dashboard;