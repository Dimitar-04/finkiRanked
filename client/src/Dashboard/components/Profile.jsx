import React, { use, useState } from "react";
import pp from "../../assets/images/pp.svg";
import Navbar from "./Navbar";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate("/logout");
  };

  return (
    <div
      data-theme="luxury"
      className="dashboard min-h-screen flex bg-gradient-to-br from-base-100 to-base-200"
    >
      <div
        data-theme="luxury"
        className="w-full flex flex-col items-center p-6"
      >
        <div className="card w-full max-w-2xl bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-base-content/70">Loading profile...</p>
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="avatar mb-4">
                    <div className="w-32 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-lg">
                      <img src={pp} alt="Profile" className="object-cover" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-base-content mb-2">
                    {user.name}
                  </h1>
                  <p className="text-base-content/60 text-lg">{user.email}</p>
                </div>
                <div className="flex flex-row justify-center">
                  <div className="bg-gradient-to-r from-tertiary/10 to-tertiary/5 p-4  w-50 rounded-lg border border-tertiary/20 flex flex-col items-center mb-8">
                    <RankBadgeNav rankName={user.rank} size="lg" />
                    <p className="text-sm text-base-content/70 mt-2">
                      Current Rank
                    </p>
                  </div>
                </div>
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-4 rounded-lg border border-secondary/20">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-secondary">
                        {user.points}
                      </span>
                      <p className="text-sm text-base-content/70">
                        Total Points
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-lg border border-accent/20">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-accent">
                        {user.solved_problems}
                      </span>
                      <p className="text-sm text-base-content/70">
                        Solved Challenges
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline btn-error hover:btn-error hover:shadow-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
