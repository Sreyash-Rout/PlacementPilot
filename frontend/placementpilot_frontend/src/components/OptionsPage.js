import React from "react";
import { useNavigate } from "react-router-dom";
import "./OptionsPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ticTacToeImage from "../Images/tictactoe.png";


const features = [
  {
    description: "Get instant AI-powered feedback on your resume! Our system analyzes your resume, suggests improvements, and provides curated resources and videos to help you craft the perfect resume.",
    image: "https://th.bing.com/th/id/OIP.5xz7n9dsQ4082K-jszugiQHaHa?rs=1&pid=ImgDetMain",
    comingSoon: false,
    link: "/resume", 
  },
  {
    description: "Gamified Tic-Tac-Toe with quiz challenges! Answer correctly to make a move.",
    image: ticTacToeImage,
    comingSoon: false,
    link: "/gaming", // Ensure navigation works
  },
  {
    description: "Share your experiences and explore detailed insights from others about interviews, company culture, and job roles. This platform helps you prepare better by learning from real stories and tips shared by people who've been there.",
    image: "https://clipground.com/images/job-interview-clip-art-3.jpg",
    comingSoon: false,
    link:"/experiences"
  }
  
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
            onClick={() => feature.link && navigate(feature.link)} 
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