import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import LandingPage from "./LandingPage/LandingPage";
import Register from "./Register/Register";
import Login from "./LogIn/LogIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </StrictMode>
);
