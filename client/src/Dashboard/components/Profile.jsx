import React, { useState } from "react";
import pp from "../../assets/images/pp.svg";
import Navbar from "./Navbar";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [modal, setModal] = useState({ isOpen: false, message: "", type: "" });

  const handleSignOut = () =>
    setModal({
      isOpen: true,
      message: "Are you sure you want to log out?",
      type: "confirmLogout",
    });

  const closeModal = () => setModal({ isOpen: false, message: "", type: "" });

  const confirmLogout = () => {
    closeModal();
    navigate("/logout");
  };

  return (
    <div
      data-theme="luxury"
      className="dashboard flex bg-gradient-to-br from-base-100 to-base-200"
    >
      <div
        data-theme="luxury"
        className="w-full flex flex-col items-center p-4 sm:p-5"
      >
        <div className="card w-full md:max-w-md 2xl:max-w-xl bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-5">
            {loading ? (
              <div className="flex flex-col items-center py-10">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-3 text-base-content/70">Loading profile...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="avatar mb-3">
                    <div className="w-20 md:w-24 2xl:w-34 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-lg">
                      <img src={pp} alt="Profile" className="object-cover" />
                    </div>
                  </div>
                  <h1 className="text-xl md:text-2xl  2xl:text-3xl font-bold text-base-content">
                    {user.name}
                  </h1>
                  <p className="text-sm 2xl:text-xl text-base-content/60">
                    {user.email}
                  </p>
                </div>

                {/* Rank */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-tertiary/10 to-tertiary/5 p-3 rounded-lg border border-tertiary/20 flex flex-col items-center min-w-[120px]">
                    <RankBadgeNav rankName={user.rank} size="md" />
                    <p className="text-xs 2xl:text-lg text-base-content/70 mt-1">
                      Current Rank
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-3 rounded-lg border border-secondary/20 text-center">
                    <span className="text-lg font-bold text-secondary block">
                      {user.points}
                    </span>
                    <p className="text-xs text-base-content/70">Total Points</p>
                  </div>
                  <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-3 rounded-lg border border-accent/20 text-center">
                    <span className="text-lg font-bold text-accent block">
                      {user.solved_problems}
                    </span>
                    <p className="text-xs text-base-content/70">
                      Solved Challenges
                    </p>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline btn-error hover:shadow-lg btn-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="10"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />

                      <circle cx="6.5" cy="12" r="1" fill="currentColor" />

                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 12h5m-2-2 2 2-2 2"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xs p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-base-200 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-error flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-error-content"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-base sm:text-lg" id="modal-title">
                Log Out
              </h3>
            </div>
            <div className="flex py-3 sm:py-4 items-center gap-3">
              <p className="font-bold text-sm sm:text-base whitespace-pre-line">
                {modal.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6 sm:mt-8">
              <button
                className="btn btn-ghost btn-sm sm:btn-md"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm sm:btn-md"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
