import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const DashboardLayout = () => {
  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-hidden"
    >
      <Navbar />
      <div className="flex-1 w-full h-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
