import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import OptionsPage from "./components/OptionsPage";
import Gaming from "./components/gaming";
import PostExp from "./components/PostExp";  // Import PostExp
import ExpList from "./components/ExpList";  // Import ReviewList (renamed from ExpList for consistency)

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/options" element={<OptionsPage />} />
        <Route path="/gaming" element={<Gaming />} />
        <Route path="/post-experience" element={<PostExp />} /> {/* Route to post experience */}
        <Route path="/experiences" element={<ExpList />} /> {/* Route to view experiences */}
      </Routes>
    </Router>
  );
};

export default App;
