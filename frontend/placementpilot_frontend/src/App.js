import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import OptionsPage from "./components/OptionsPage";
import Gaming from "./components/gaming"; //

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/options" element={<OptionsPage />} />
        <Route path="/gaming" element={<Gaming />} />
      </Routes>
    </Router>
  );
};

export default App;
