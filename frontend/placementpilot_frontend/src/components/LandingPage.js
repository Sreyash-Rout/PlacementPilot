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
                    PlacementPilot is your ultimate career companion, offering AI-driven job recommendations, expert interview preparation, and real-time placement insights. We help students and job seekers navigate the competitive job market with tailored resources, interactive mock tests, and a dynamic learning environment. Elevate your career with PlacementPilot today!
                </p>
            </div>
            <Footer/>
        </div>
    );
};

export default LandingPage;
