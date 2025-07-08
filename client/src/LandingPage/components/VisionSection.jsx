import React from "react";
import lista from "../../assets/images/listaNoBg.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const VisionSection = () => {
  const navigate = useNavigate();
  const user = useAuth();
  return (
    <div className="hero bg-base-200 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] py-8 sm:py-12">
      <div className="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col p-4 sm:p-6 lg:p-10 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            How does it work?
          </h1>
          <p className="py-3 sm:py-4 lg:py-6 leading-relaxed text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
            Every day we post a new coding problem at precisely 7am. If you have
            made an account using your students email address, you get access to
            the coding problem and can submit your solution. The earlier you
            submit your solution, the more points you get. The less attempts you
            need to solve it, the better your score will be. According to their
            points, students receive one of the ten ranks and are ranked on a
            leaderboard.
          </p>
          <button
            className="btn btn-sm sm:btn-md lg:btn-lg xl:btn-xl w-full sm:w-64 lg:w-80 bg-black text-white hover:bg-gray-800 mx-auto lg:mx-0"
            onClick={() => {
              user ? navigate("/dashboard") : navigate("/register");
            }}
          >
            Join now
          </button>
        </div>
        <img
          src={lista}
          className="w-48 sm:w-64 md:w-80 lg:w-100 h-auto max-w-full"
          alt="Leaderboard illustration"
        />
      </div>
    </div>
  );
};

export default VisionSection;
