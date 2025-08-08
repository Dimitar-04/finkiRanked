import React from 'react';
import lista from '../../assets/images/listaNoBg.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const VisionSection = () => {
  const navigate = useNavigate();
  const user = useAuth();
  return (
    <div className="hero bg-base-200 min-h-[50vh] sm:min-h-[55vh] lg:min-h-[65vh] py-6 sm:py-8">
      <div className="hero-content flex-col lg:flex-row-reverse gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col p-3 sm:p-4 lg:p-6 text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            How does it work?
          </h1>
          <p className="py-2 sm:py-3 lg:py-4 leading-relaxed text-sm sm:text-sm md:text-base lg:text-base mb-3 sm:mb-4">
            Every day we post a new coding problem at precisely 7am. If you have
            made an account using your students email address, you get access to
            the coding problem and can submit your solution. The earlier you
            submit your solution, the more points you get. The less attempts you
            need to solve it, the better your score will be. According to their
            points, students receive one of the ten ranks and are ranked on a
            leaderboard.
          </p>
          <button
            className="btn btn-sm sm:btn-md lg:btn-lg w-full sm:w-48 lg:w-60 bg-black text-white hover:bg-gray-800 mx-auto lg:mx-0"
            onClick={() => {
              user ? navigate('/dashboard') : navigate('/register');
            }}
          >
            Join now
          </button>
        </div>
        <img
          src={lista}
          className="w-40 sm:w-48 md:w-56 lg:w-72 h-auto max-w-full"
          alt="Leaderboard illustration"
        />
      </div>
    </div>
  );
};

export default VisionSection;
