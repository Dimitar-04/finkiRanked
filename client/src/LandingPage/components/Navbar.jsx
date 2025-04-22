import React from "react";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm justify-between p-6">
      <div className="navbar-start ml-10">
        <a className="btn btn-ghost">
          <img
            src="../images/logoIcon.png"
            alt="Logo"
            className="h-10 w-auto"
          />
          <img
            src="../images/logoText.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </a>
      </div>
      <div className="navbar-end mr-10">
        <a className="btn btn-lg">Register</a>
      </div>
    </div>
  );
};

export default Navbar;
