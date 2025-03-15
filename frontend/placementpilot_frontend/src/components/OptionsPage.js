import React from "react";
import { useNavigate } from "react-router-dom";
import "./OptionsPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";


const features = [
  {
    description: "Get instant AI-powered feedback on your resume! Our system analyzes your resume, suggests improvements, and provides curated resources and videos to help you craft the perfect resume.",
    image: "https://th.bing.com/th/id/OIP.5xz7n9dsQ4082K-jszugiQHaHa?rs=1&pid=ImgDetMain",
    comingSoon: false,
    link: "/resume", 
  },
  {
    description: "Video Solutions to LeetCode contest.",
    image: "https://example.com/contest.png",
    comingSoon: false,
    link: "/gaming", // Ensure navigation works
  },
  {
    description: "Complete LLD & HLD for Interviews.",
    image: "https://example.com/system-design.png",
    comingSoon: true,
  },
  {
    description: "Roadmaps to help you learn efficiently.",
    image: "https://example.com/roadmap.png",
    comingSoon: true,
  },
];

const OptionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="features-container">
      <Navbar />
      <h2 className="features-title">The Resources You Need to Succeed</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card"
            onClick={() => feature.link && navigate(feature.link)} // Fix navigation for all valid links
          >
            {feature.comingSoon && <span className="coming-soon">Coming Soon</span>}
            <img src={feature.image} alt="Feature" className="feature-image" />
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default OptionsPage;