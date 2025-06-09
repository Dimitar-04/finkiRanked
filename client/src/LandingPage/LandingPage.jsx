import React from 'react';
import Hero from './components/Hero';
import VisionSection from './components/VisionSection';
import Footer from './components/Footer';
import Intro from './components/Intro';
import NavbarLanding from './components/NavbarLanding';
import LeaderBoardEx from '@/LandingPage/components/LeaderBoardEx.jsx';

const LandingPage = () => {
  return (
    <div data-theme="luxury" className="h-screen overflow-y-auto">
      <NavbarLanding />
      <Hero />
      <Intro />
      <VisionSection />
      <LeaderBoardEx />
      <Footer />
    </div>
  );
};

export default LandingPage;
