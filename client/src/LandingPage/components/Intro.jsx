import React from "react";

const Intro = () => {
  return (
    <div className="hero bg-base-200 min-h-[80vh]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src="../images/logo.png"
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold">What is FINKI-Ranked?</h1>
          <p className="py-6 leading-loose">
            FINKI-Ranked is a web platform where students receive a daily
            task/challenge, compete to solve it, and are ranked according to the
            points earned. This platform aims to develop a competitive spirit
            among students, create better work habits, and develop collegiality
            and communication between students.
          </p>
          <p className="py-6 leading-loose">
            The goal of our application is to create a platform for programming
            challenges that will allow FINKI students to solve algorithmic tasks
            on a daily basis, track their progress, and compete with each other.
            The application will provide easy access to challenges, automatic
            evaluation of solutions, and a points and ranking system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Intro;
