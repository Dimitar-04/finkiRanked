import React from "react";

const VisionSection = () => {
  return (
    <div className="hero bg-base-200 min-h-[80vh]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="flex flex-col p-10 text-center lg:text-left">
          <h1 className="text-5xl font-bold">How does it work?</h1>
          <p className="py-6 leading-loose">
            Every day we post a new coding problem at precisely 7am. If you have
            made an account using your students email address, you get access to
            the coding problem and can submit your solution. The earlier you
            submit your solution, the more points you get. The less attempts you
            need to solve it, the better your score will be. According to their
            points, students receive one of the ten ranks and are ranked on a
            leaderboard.
          </p>
          <a className="btn btn-xl w-80 bg-black">Join now</a>
        </div>
        <img src="../images/lista.jpg" className="w-100 h-100" />
      </div>
    </div>
  );
};

export default VisionSection;
