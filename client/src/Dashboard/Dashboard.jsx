import React, { useState } from "react";
import logoIcon from "../assets/images/logoIcon.png";
import logoText from "../assets/images/logoText.png";
import pp from "../assets/images/pp.svg";

import Task from "./components/Task";
import LeaderBoardEx from "@/LandingPage/components/LeaderBoardEx";
import Forum from "./components/Forum";
import Profile from "./components/Profile";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <Task />;
      case "competitions":
        return <Forum />;
      case "leaderboard":
        return <LeaderBoardEx />;
      case "profile":
        return <Profile />;
      default:
        return (
          <div className="text-center text-xl font-semibold">
            Page Not Found
          </div>
        );
    }
  };

  return (
    <div data-theme="luxury" className="dashboard min-h-screen flex">
      <nav className="dashboard__navbar w-70 p-2 flex flex-col items-center border-r">
        <div className="flex space-x-4 mb-10 mt-2.5">
          <a href="/" className="flex items-center space-x-4">
            <img src={logoIcon} alt="Logo 1" className="w-18" />
            <img src={logoText} alt="Logo 2" className="w-40" />
          </a>
        </div>
        <ul className="flex flex-col space-y-4 flex-grow">
          <li
            className={`cursor-pointer ${
              activePage === "home" ? "font-bold underline" : ""
            }`}
            onClick={() => setActivePage("home")}
          >
            Task of the Day
          </li>
          <li
            className={`cursor-pointer ${
              activePage === "leaderboard" ? "font-bold underline" : ""
            }`}
            onClick={() => setActivePage("leaderboard")}
          >
            Leaderboard
          </li>
          <li
            className={`cursor-pointer ${
              activePage === "competitions" ? "font-bold underline" : ""
            }`}
            onClick={() => setActivePage("competitions")}
          >
            Forum
          </li>
        </ul>
        <div
          className={`cursor-pointer dashboard__profile flex flex-row gap-10 items-center mt-auto ${
            activePage === "profile" ? "font-bold" : ""
          }`}
          onClick={() => setActivePage("profile")}
        >
          <img
            src={pp}
            alt="Profile"
            className="dashboard__profile-picture w-12 h-12 rounded-full border"
          />
          <p className="font-medium mt-2">John Doe</p>
        </div>
      </nav>
      <main className="dashboard__content flex-1 p-6">{renderPage()}</main>
    </div>
  );
};

export default Dashboard;
