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
    <div className="navbar bg-base-100 shadow-sm justify-between p-6">
      <div className="navbar-start ml-10">
        <a className="btn btn-ghost">
          <img src={logoIcon} alt="Logo" className="h-10 w-auto" />
          <img src={logoText} alt="Logo" className="h-10 w-auto" />
        </a>
      </div>
      <div className="navbar-end mr-10">
        {!user && (
          <button className="btn btn-lg" onClick={handleRegisterClick}>
            Register
          </button>
        )}
        {user && (
          <button className="btn btn-lg" onClick={() => navigate("/dashboard")}>
            {user.username}
          </button>
        )}
      </div>
    </div>
  );
};

export default NavbarLanding;
