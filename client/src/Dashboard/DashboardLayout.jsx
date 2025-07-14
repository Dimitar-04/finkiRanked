import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const DashboardLayout = () => {
  return (
    <div data-theme="luxury" className="dashboard flex h-screen bg-base-100">
      <Navbar />
      {/* Main content area */}
      <div className="flex-1 h-full overflow-y-auto lg:ml-0 pt-20 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
