import React from 'react';
import Hero from './components/Hero';
import VisionSection from './components/VisionSection';
import Footer from './components/Footer';
import Intro from './components/Intro';
import NavbarLanding from './components/NavbarLanding';
import LeaderLanding from './components/LeaderLanding';
const LandingPage = () => {
  return (
    <div data-theme="luxury" className="overflow-y-auto h-screen">
      <NavbarLanding />
      <Hero />
      <Intro />
      <VisionSection />
      <LeaderLanding />
      <Footer />
    </div>
  );
};

export default LandingPage;
