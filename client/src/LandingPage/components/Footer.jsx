import React from 'react';
import logoIcon from '../../assets/images/logoIcon.png';
const Footer = () => {
  return (
    <footer className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10 b">
      <nav className="grid grid-flow-col gap-4">
        <a className="link link-hover">Register</a>
        <a className="link link-hover">Login in</a>
        <a className="link link-hover">Attempt a challenge</a>
        <a className="link link-hover">Leaderboard</a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <img src={logoIcon} alt="logo" className="w-50" />
        </div>
      </nav>
      <aside>
        <p>
          Copyright © {new Date().getFullYear()} - All right reserved by
          FinkiRanked
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
