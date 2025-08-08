import React from 'react';
import logoIcon from '../../assets/images/logoIcon.png';

const Intro = () => {
  return (
    <div className="hero bg-base-200 min-h-[50vh] sm:min-h-[55vh] lg:min-h-[65vh] py-6 sm:py-8">
      <div className="hero-content flex-col lg:flex-row-reverse gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <img
          src={logoIcon}
          className="w-40 sm:w-48 md:w-56 lg:w-64 xl:max-w-sm rounded-lg shadow-lg"
          alt="FINKI Ranked Logo"
        />
        <div className="text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            What is FINKI Ranked?
          </h1>
          <p className="py-2 sm:py-3 lg:py-4 leading-relaxed text-sm sm:text-sm md:text-base lg:text-base">
            FINKI Ranked is a web platform where students receive a daily
            task/challenge, compete to solve it, and are ranked according to the
            points earned. This platform aims to develop a competitive spirit
            among students, create better work habits, and develop collegiality
            and communication between students.
          </p>
          <p className="py-2 sm:py-3 lg:py-4 leading-relaxed text-sm sm:text-sm md:text-base lg:text-base">
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
