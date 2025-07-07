// Example for Profile.jsx
import React from "react";
import pp from "../../assets/images/pp.svg";
import Navbar from "./Navbar";
import RankBadgeNav from "@/utils/RankBadgeForNavbar";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const Profile = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    navigate("/logout");
  };

  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <div
        data-theme="luxury"
        className="w-full flex flex-col items-center p-6 bg-base-200"
      >
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            {loading ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={pp} alt="Profile" />
                  </div>
                </div>
                <h2 className="card-title mt-4">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-4">
                  <div className="text-lg">
                    <RankBadgeNav rankName={user.rank} size="lg" />
                  </div>
                  <p className="text-lg mt-5">
                    <span className="font-bold">Total Points:</span>{" "}
                    {user.points}
                  </p>
                  <p className="text-lg mt-5">
                    <span className="font-bold">Solved Challenges:</span>{" "}
                    {user.solved_problems}
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    onClick={handleSignOut}
                    className="btn btn-action btn-sm mx-2"
                  >
                    Sign Out
                  </a>
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
