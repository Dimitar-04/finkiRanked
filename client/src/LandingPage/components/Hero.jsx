import React from 'react';
import hero from '../../assets/images/hero-bg.jpg';
import { Link, useNavigate } from 'react-router-dom';

const Hero = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return (
    <div
      className="hero min-h-[80vh]"
      style={{
        backgroundImage: `url(${hero})`,
      }}
    >
      <div className="hero-overlay "></div>
      <div className="hero-content text-neutral-content text-center bg-black/70 p-20 rounded-lg">
        <div className="max-w-md">
          <h1 className="mb-5 text-6xl font-bold">FINKI RANKED</h1>
          <p className="mb-5">
            Daily coding challenges and competitions for FINKI students
          </p>
          {!user && (
            <Link to="/login" className="btn btn-xl">
              Join now
            </Link>
          )}
          {user && (
            <Link to="/dashboard" className="btn btn-xl">
              Join now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
