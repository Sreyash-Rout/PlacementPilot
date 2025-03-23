import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="container">
            <Navbar/>
            <div className="hero">
                <h2>Welcome to PlacementPilot</h2>
                <p>Your journey to career success starts here.</p>
                <button className="btn-3d" onClick={() => navigate("/options")}>
                    Get Started
                </button>
            </div>

            <div className="what-we-provide">
                <h2>What We Provide</h2>
                <p>
                PlacementPilot is an innovative platform designed to revolutionize the placement journey by offering in-depth insights, AI-powered personalized recommendations, immersive gamified learning experiences, and real-world interview insights. Our goal is to empower job seekers with the right tools, knowledge, and skills to confidently navigate the recruitment process and secure their dream jobs.
                </p>
            </div>
            <Footer/>
        </div>
    );
};

export default LandingPage;
