import React from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/images/logoIcon.png";
import logoText from "../../assets/images/logoText.png";
import pp from "../../assets/images/pp.svg";
import RankBadge from "@/utils/RankBadge";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  return (
    <nav className="dashboard__navbar w-80 min-h-screen bg-base-200 text-base-content">
      <div className="p-4 border-b border-base-content/10">
        <a href="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="Logo" className="w-14 h-auto" />
          <img src={logoText} alt="Logo Text" className="w-32 h-auto" />
        </a>
      </div>

      <div className="px-4 py-8">
        <ul className="menu menu-lg gap-2">
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors `}
              onClick={() => navigate("/dashboard")}
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
              Challenge of the Day
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors`}
              onClick={() => navigate("/dashboard/leaderboard")}
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
              onClick={() => navigate("/dashboard/forum")}
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
          {user && user.isModerator && (
            <li>
              <button
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors`}
                onClick={() => navigate("/dashboard/manage-posts")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
                Manage Posts
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="absolute bottom-0 left-0 w-64 right-0 p-4 border-t border-base-content/10">
        <button
          className={`flex items-center gap-3  px-4 py-3 hover:bg-[#FFB800] hover:text-black rounded-lg transition-colors `}
          onClick={() => navigate("/dashboard/profile")}
        >
          <img
            src={pp}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-base-content/10"
          />
          <div className="flex flex-col items-start cursor-pointer">
            <span className="font-medium text-left">
              {user && user.username}
            </span>
            <span className="text-sm text-base-content/70 mt-2">
              {user && <RankBadge rankName={user.rank} size="sm" />}
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
}
