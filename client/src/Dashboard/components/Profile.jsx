// Example for Profile.jsx
import React from "react";
import pp from "../../assets/images/pp.svg";

const Profile = () => {
  const handleSignOut = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User data:", user);
  if (!user) {
    console.error("No user data found in localStorage.");
  }
  return (
    <div
      data-theme="luxury"
      className="flex flex-col items-center p-6 bg-base-200"
    >
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={pp} alt="Profile" />
            </div>
          </div>
          <h2 className="card-title mt-4">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <div className="mt-4">
            <p className="text-lg">
              <span className="font-bold">Rank:</span> {user.rank}
            </p>
            <p className="text-lg">
              <span className="font-bold">Points:</span> {user.points}
            </p>
          </div>
          <div className="mt-6">
            <a onClick={handleSignOut} className="btn btn-action btn-sm mx-2">
              Sign Out
            </a>
            <a href="/register" className="btn btn-action btn-sm mx-2">
              Create New Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
