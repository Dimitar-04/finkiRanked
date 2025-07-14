import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../../assets/images/logoIcon.png";
import logoText from "../../assets/images/logoText.png";
import pp from "../../assets/images/pp.svg";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    if (
      (path === "/dashboard/forum" || path === "/dashboard/user-posts") &&
      (location.pathname === "/dashboard/forum" ||
        location.pathname === "/dashboard/forum/create-post" ||
        location.pathname === "/dashboard/create-post" ||
        location.pathname === "/dashboard/user-posts" ||
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

  return (
    <>
      {/* Desktop Sidebar - hidden on tablet and below */}
      <nav className="dashboard__navbar hidden lg:flex w-80 min-h-screen bg-base-200 text-base-content border-r border-base-content/10 flex-col flex-shrink-0">
        <div className="p-4 border-b border-base-content/10">
          <p
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={logoIcon} alt="Logo" className="w-14 h-auto" />
            <img src={logoText} alt="Logo Text" className="w-32 h-auto" />
          </p>
        </div>

        <div className="flex-1 py-8">
          <ul className="menu menu-lg gap-2">
            <li>
              <button
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard")
                    ? "bg-[#FFB800] text-black"
                    : "hover:bg-[#FFB800] hover:text-black"
                }`}
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
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/leaderboard")
                    ? "bg-[#FFB800] text-black"
                    : "hover:bg-[#FFB800] hover:text-black"
                }`}
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
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/dashboard/forum")
                    ? "bg-[#FFB800] text-black"
                    : "hover:bg-[#FFB800] hover:text-black"
                }`}
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
              <>
                <hr />
                <li>
                  <button
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                      isActive("/dashboard/manage-posts")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
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
                    Manage Posts
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                      isActive("/dashboard/manage-challenges")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => navigate("/dashboard/manage-challenges")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
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
                    Manage Challenges
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="p-4 border-t border-base-content/10">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/dashboard/profile")
                ? "bg-[#FFB800] text-black"
                : "hover:bg-[#FFB800] hover:text-black"
            }`}
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
                {user && <RankBadgeNav rankName={user.rank} size="sm" />}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Top Menu Bar - visible on tablet and below */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-200 border-b border-base-content/10">
        {/* ...existing mobile menu code... */}
        <div className="flex items-center justify-between p-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={logoIcon} alt="Logo" className="w-10 h-auto" />
            <img src={logoText} alt="Logo Text" className="w-24 h-auto" />
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-base-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-base-content/10 bg-base-200">
            <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
              <ul className="p-4 space-y-2">
                <li>
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive("/dashboard")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
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
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive("/dashboard/leaderboard")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => {
                      navigate("/dashboard/leaderboard");
                      setIsMobileMenuOpen(false);
                    }}
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
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive("/dashboard/forum")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => {
                      navigate("/dashboard/forum");
                      setIsMobileMenuOpen(false);
                    }}
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
                <li>
                  <button
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive("/dashboard/user-posts")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => {
                      navigate("/dashboard/user-posts");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Your Forum Posts
                  </button>
                </li>
                {user && user.isModerator && (
                  <>
                    <hr className="my-2" />
                    <li>
                      <button
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                          isActive("/dashboard/manage-posts")
                            ? "bg-[#FFB800] text-black"
                            : "hover:bg-[#FFB800] hover:text-black"
                        }`}
                        onClick={() => {
                          navigate("/dashboard/manage-posts");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
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
                        Manage Posts
                      </button>
                    </li>
                    <li>
                      <button
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${
                          isActive("/dashboard/manage-challenges")
                            ? "bg-[#FFB800] text-black"
                            : "hover:bg-[#FFB800] hover:text-black"
                        }`}
                        onClick={() => {
                          navigate("/dashboard/manage-challenges");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
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
                        Manage Challenges
                      </button>
                    </li>
                  </>
                )}

                {/* Profile section in mobile menu */}
                <hr className="my-2" />
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive("/dashboard/profile")
                        ? "bg-[#FFB800] text-black"
                        : "hover:bg-[#FFB800] hover:text-black"
                    }`}
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <img
                      src={pp}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-base-content/10"
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-left">
                        {user && user.username}
                      </span>
                      <span className="text-sm text-base-content/70">
                        {user && (
                          <RankBadgeNav rankName={user.rank} size="sm" />
                        )}
                      </span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
