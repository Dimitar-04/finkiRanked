import React from "react";

const Hero = () => {
  return (
    <div
      className="hero min-h-[80vh]"
      style={{
        backgroundImage: "url(../images/hero-bg.jpg)",
      }}
    >
      <div className="hero-overlay "></div>
      <div className="hero-content text-neutral-content text-center bg-black/70 p-20 rounded-lg">
        <div className="max-w-md">
          <h1 className="mb-5 text-6xl font-bold">FINKI RANKED</h1>
          <p className="mb-5">
            Daily coding challenges and competitions for FINKI students
          </p>
          <a className="btn btn-xl">Join now</a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
