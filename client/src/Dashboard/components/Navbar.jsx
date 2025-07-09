import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../../assets/images/logoIcon.png";
import logoText from "../../assets/images/logoText.png";
import pp from "../../assets/images/pp.svg";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "@/contexts/AuthContext";

// Sidebar Provider Component
const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="drawer-toggle"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* Mobile navbar */}
        <div className="navbar bg-base-200 lg:hidden border-b border-base-content/10">
          <div className="flex-none">
            <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <a href="/" className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="w-8 h-auto" />
              <img src={logoText} alt="Logo Text" className="w-24 h-auto" />
            </a>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-0">{children}</main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
        <AppSidebar onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
};

// Sidebar Component
const AppSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    if (
      path === "/dashboard/forum" &&
      (location.pathname === "/dashboard/forum" ||
        location.pathname === "/dashboard/forum/create-post" ||
        location.pathname === "/dashboard/create-post" ||
        location.pathname.startsWith("/dashboard/forum-detail/"))
    ) {
      return true;
    }
    if (
      path === "/dashboard/manage-posts" &&
      location.pathname === "/dashboard/manage-posts"
    ) {
      return true;
    }
    if (
      path === "/dashboard/leaderboard" &&
      location.pathname === "/dashboard/leaderboard"
    ) {
      return true;
    }

    if (
      path === "/dashboard/profile" &&
      location.pathname === "/dashboard/profile"
    ) {
      return true;
    }

    if (
      path === "/dashboard/manage-challenges" &&
      (location.pathname === "/dashboard/manage-challenges" ||
        location.pathname === "/dashboard/create-new-challenge")
    ) {
      return true;
    }
    if (path !== "/dashboard" && location.pathname.startsWith(path + "/")) {
      return true;
    }
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside className="w-80 min-h-full bg-base-200 text-base-content border-r border-base-content/10 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-base-content/10">
        <a href="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="Logo" className="w-14 h-auto" />
          <img src={logoText} alt="Logo Text" className="w-32 h-auto" />
        </a>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 py-8">
        <ul className="menu menu-lg gap-2">
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard")
                  ? "bg-[#FFB800] text-black"
                  : "hover:bg-[#FFB800] hover:text-black"
              }`}
              onClick={() => handleNavigation("/dashboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span>Challenge of the Day</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/leaderboard")
                  ? "bg-[#FFB800] text-black"
                  : "hover:bg-[#FFB800] hover:text-black"
              }`}
              onClick={() => handleNavigation("/dashboard/leaderboard")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 20V10M12 20V4M6 20v-6"></path>
              </svg>
              <span>Leaderboard</span>
            </button>
          </li>
          <li>
            <button
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive("/dashboard/forum")
                  ? "bg-[#FFB800] text-black"
                  : "hover:bg-[#FFB800] hover:text-black"
              }`}
              onClick={() => handleNavigation("/dashboard/forum")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 shrink-0"
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
              <span>Forum</span>
            </button>
          </li>
          {user && user.isModerator && (
            <>
              <li>
                <div className="divider my-2"></div>
              </li>
              <li>
                <button
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive("/dashboard/manage-posts")
                      ? "bg-[#FFB800] text-black"
                      : "hover:bg-[#FFB800] hover:text-black"
                  }`}
                  onClick={() => handleNavigation("/dashboard/manage-posts")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                  <span>Manage Posts</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive("/dashboard/manage-challenges")
                      ? "bg-[#FFB800] text-black"
                      : "hover:bg-[#FFB800] hover:text-black"
                  }`}
                  onClick={() =>
                    handleNavigation("/dashboard/manage-challenges")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                  <span>Manage Challenges</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-base-content/10 ">
        <button
          className={`flex items-center gap-3 px-4 py-3  cursor-pointer rounded-lg transition-colors w-full ${
            isActive("/dashboard/profile")
              ? "bg-[#FFB800] text-black"
              : "hover:bg-[#FFB800] hover:text-black"
          }`}
          onClick={() => handleNavigation("/dashboard/profile")}
        >
          <img
            src={pp}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-base-content/10 shrink-0"
          />
          <div className="flex flex-col items-start ">
            <span className="font-medium text-left">
              {user && user.username}
            </span>
            <span className="text-sm text-base-content/70 mt-1">
              {user && <RankBadgeNav rankName={user.rank} size="sm" />}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};

// Main Navbar Component (now acts as a layout wrapper)
export default function Navbar({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
