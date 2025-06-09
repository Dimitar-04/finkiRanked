import React from "react";
import logoIcon from "../../assets/images/logoIcon.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="footer footer-horizontal footer-center bg-base-100 text-base-content rounded p-10 b">
      <nav className="grid grid-flow-col gap-4">
        <a
          className="link link-hover"
          onClick={() => {
            navigate("/register");
          }}
        >
          Register
        </a>
        <a
          className="link link-hover"
          onClick={() => {
            navigate("/login");
          }}
        >
          Log In
        </a>
        <a
          className="link link-hover"
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Attempt a challenge
        </a>
        <a
          className="link link-hover"
          onClick={() => {
            navigate("/dashboard/leaderboard");
          }}
        >
          Leaderboard
        </a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <img src={logoIcon} alt="logo" className="w-50" />
        </div>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All right reserved by
          FinkiRanked
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
