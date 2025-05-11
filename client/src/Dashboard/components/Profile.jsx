import React from "react";
import pp from "../../assets/images/pp.svg";

const Profile = () => {
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
          <h2 className="card-title mt-4">John Doe</h2>
          <p className="text-gray-500">johndoe@students.finki.ukim.mk</p>
          <div className="mt-4">
            <p className="text-lg">
              <span className="font-bold">Rank:</span> Gold
            </p>
            <p className="text-lg">
              <span className="font-bold">Points:</span> 1200
            </p>
          </div>
          <div className="mt-6">
            <a href="/" className="btn btn-action btn-sm mx-2">
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
