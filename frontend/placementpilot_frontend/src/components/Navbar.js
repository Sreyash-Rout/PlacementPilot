import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">🚀 PlacementPilot</div>
      <div className="nav-links">
        <a href="#welcome" className="nav-item">Welcome, User</a>
      </div>
    </nav>
  );
};

export default Navbar;
