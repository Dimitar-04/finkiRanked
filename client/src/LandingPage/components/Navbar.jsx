import React from 'react';
import logoIcon from '../../assets/images/logoIcon.png';
import logoText from '../../assets/images/logoText.png';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    navigate('/register');
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
        <button className="btn btn-lg" onClick={handleRegisterClick}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Navbar;
