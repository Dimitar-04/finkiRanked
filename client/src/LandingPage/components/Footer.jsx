import React, { use } from 'react';
import logoIcon from '../../assets/images/logoIcon.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <footer className="footer footer-horizontal footer-center bg-base-100 text-base-content rounded p-6 sm:p-8">
      <nav className="grid grid-flow-col gap-3 sm:gap-4">
        <a
          className="link link-hover text-sm sm:text-base"
          onClick={() => {
            if (user) {
              navigate('/dashboard');
            } else {
              navigate('/register');
            }
          }}
        >
          Register
        </a>
        <a
          className="link link-hover text-sm sm:text-base"
          onClick={() => {
            if (user) {
              navigate('/dashboard');
            } else {
              navigate('/login');
            }
          }}
        >
          Log In
        </a>
        <a
          className="link link-hover text-sm sm:text-base"
          onClick={() => {
            navigate('/dashboard');
          }}
        >
          Attempt the challenge
        </a>
        <a
          className="link link-hover text-sm sm:text-base"
          onClick={() => {
            navigate('/dashboard/leaderboard');
          }}
        >
          Leaderboard
        </a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-3 sm:gap-4">
          <img src={logoIcon} alt="logo" className="w-32 sm:w-40" />
        </div>
      </nav>
      <aside>
        <p className="text-sm sm:text-base">
          Copyright © {new Date().getFullYear()} - All right reserved by
          FinkiRanked
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
