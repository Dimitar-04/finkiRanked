import React from "react";
import hero from "../../assets/images/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div
      className="hero min-h-[70vh] sm:min-h-[80vh] w-full"
      style={{
        backgroundImage: `url(${hero})`,
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center bg-black/70 p-6 sm:p-12 lg:p-20 rounded-lg mx-4 max-w-4xl">
        <div className="w-full">
          {!user && (
            <h1 className="mb-4 sm:mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              FINKI RANKED
            </h1>
          )}
          {user && (
            <h1 className="mb-4 sm:mb-5 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Welcome back, {user.username}
            </h1>
          )}

          <p className="mb-4 sm:mb-5 text-sm sm:text-base lg:text-lg px-2">
            Daily coding challenges for FINKI students
          </p>
          {!user && (
            <button
              className="btn btn-sm sm:btn-md lg:btn-lg xl:btn-xl px-6 sm:px-8"
              onClick={() => navigate("/login")}
            >
              Join now
            </button>
          )}
          {user && (
            <button
              className="btn btn-sm sm:btn-md lg:btn-lg xl:btn-xl px-6 sm:px-8"
              onClick={() => navigate("/dashboard")}
            >
              <span className="hidden sm:inline">Solve today's challenge</span>
              <span className="sm:hidden">Solve Challenge</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
