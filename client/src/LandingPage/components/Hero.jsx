import React from "react";
import hero from "../../assets/images/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  return (
    <div
      className="hero min-h-[80vh]"
      style={{
        backgroundImage: `url(${hero})`,
      }}
    >
      <div className="hero-overlay "></div>
      <div className="hero-content text-neutral-content text-center bg-black/70 p-20 rounded-lg">
        <div className="w-full">
          {!user && <h1 className="mb-5 text-6xl font-bold">FINKI RANKED</h1>}
          {user && (
            <h1 className="mb-5 text-4xl font-bold">
              Welcome back, {user.username}
            </h1>
          )}

          <p className="mb-5">Daily coding challenges for FINKI students</p>
          {!user && (
            <a className="btn btn-xl" onClick={() => navigate("/login")}>
              Join now
            </a>
          )}
          {user && (
            <a className="btn btn-xl" onClick={() => navigate("/dashboard")}>
              Solve today's challenge
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
