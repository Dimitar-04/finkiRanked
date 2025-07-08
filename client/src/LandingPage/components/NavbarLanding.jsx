import React from "react";
import logoIcon from "../../assets/images/logoIcon.png";
import logoText from "../../assets/images/logoText.png";
import { useNavigate } from "react-router-dom";
const NavbarLanding = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    navigate("/register");
  };
  return (
    <div className="navbar bg-base-100 shadow-sm justify-between p-4 sm:p-6">
      <div className="navbar-start ml-2 sm:ml-4 lg:ml-10">
        <a className="btn btn-ghost p-1 sm:p-2">
          <img src={logoIcon} alt="Logo" className="h-8 sm:h-10 w-auto" />
          <img
            src={logoText}
            alt="Logo"
            className="h-8 sm:h-10 w-auto hidden xs:block"
          />
        </a>
      </div>
      <div className="navbar-end mr-2 sm:mr-4 lg:mr-10">
        {!user && (
          <button
            className="btn btn-sm sm:btn-md lg:btn-lg"
            onClick={handleRegisterClick}
          >
            Register
          </button>
        )}
        {user && (
          <button
            className="btn btn-sm sm:btn-md lg:btn-lg"
            onClick={() => navigate("/dashboard")}
          >
            <span className="hidden sm:inline">To Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NavbarLanding;
