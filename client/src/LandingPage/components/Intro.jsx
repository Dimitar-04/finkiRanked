import React from "react";
import logoIcon from "../../assets/images/logoIcon.png";
const Intro = () => {
  return (
    <div className="hero bg-base-200 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] py-8 sm:py-12">
      <div className="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <img
          src={logoIcon}
          className="w-48 sm:w-64 md:w-80 lg:max-w-sm rounded-lg shadow-lg"
          alt="FINKI Ranked Logo"
        />
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            What is FINKI Ranked?
          </h1>
          <p className="py-3 sm:py-4 lg:py-6 leading-relaxed text-sm sm:text-base lg:text-lg">
            FINKI Ranked is a web platform where students receive a daily
            task/challenge, compete to solve it, and are ranked according to the
            points earned. This platform aims to develop a competitive spirit
            among students, create better work habits, and develop collegiality
            and communication between students.
          </p>
          <p className="py-3 sm:py-4 lg:py-6 leading-relaxed text-sm sm:text-base lg:text-lg">
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
