import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const DashboardLayout = () => {
  return (
    <div data-theme="luxury" className="dashboard h-screen bg-base-100">
      <Navbar>
        <div className="h-full w-full overflow-y-auto">
          <Outlet />
        </div>
      </Navbar>
    </div>
  );
};

export default DashboardLayout;
