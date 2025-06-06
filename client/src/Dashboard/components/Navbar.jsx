import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../assets/images/logoIcon.png';
import logoText from '../../assets/images/logoText.png';
import pp from '../../assets/images/pp.svg';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  return (
    <nav className="dashboard__navbar w-80 min-h-screen bg-base-200 text-base-content">
      <div className="p-4 border-b border-base-content/10">
        <a href="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="Logo" className="w-10 h-10" />
          <img src={logoText} alt="Logo Text" className="w-32" />
        </a>
      </div>

      <div className="px-4 py-8">
        <ul className="menu menu-lg gap-2">
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors `}
              onClick={() => navigate('/dashboard')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              Task of the Day
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors`}
              onClick={() => navigate('/dashboard/leaderboard')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 20V10M12 20V4M6 20v-6"></path>
              </svg>
              Leaderboard
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors`}
              onClick={() => navigate('/dashboard/forum')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Forum
            </button>
          </li>
        </ul>
      </div>

      <div className="absolute bottom-0 left-0 w-64 right-0 p-4 border-t border-base-content/10">
        <button
          className={`flex items-center gap-3  px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors `}
        >
          <img
            src={pp}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-base-content/10"
          />
          <div className="flex flex-col items-start">
            <span className="font-medium text-left">{user.name}</span>
            <span className="text-sm text-base-content/70">{user.rank}</span>
          </div>
        </button>
      </div>
    </nav>
  );
}
