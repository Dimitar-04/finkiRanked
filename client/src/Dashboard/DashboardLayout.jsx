import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const DashboardLayout = () => {
  return (
    <div data-theme="luxury" className="dashboard flex h-screen bg-base-100">
      <Navbar></Navbar>
      <div className="h-full w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
