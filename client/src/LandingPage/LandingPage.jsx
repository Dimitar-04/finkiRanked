import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisionSection from './components/VisionSection';
import LeaderBoardEx from './components/LeaderBoardEx';
import Footer from './components/Footer';
import Intro from './components/Intro';
const LandingPage = () => {
  return (
    <div data-theme="luxury">
      <Navbar />
      <Hero />
      <Intro />
      <VisionSection />
      <LeaderBoardEx />
      <Footer />
    </div>
  );
};

export default LandingPage;
