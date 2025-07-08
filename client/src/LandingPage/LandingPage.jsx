import React from "react";
import Hero from "./components/Hero";
import VisionSection from "./components/VisionSection";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import NavbarLanding from "./components/NavbarLanding";
import LeaderBoardEx from "@/LandingPage/components/LeaderBoardEx.jsx";
import { OurRankSystem } from "./components/OurRankSystem";

const LandingPage = () => {
  return (
    <div data-theme="luxury" className="min-h-screen w-full overflow-x-hidden">
      <NavbarLanding />
      <Hero />
      <Intro />
      <VisionSection />
      <LeaderBoardEx />
      <OurRankSystem />
      <Footer />
    </div>
  );
};

export default LandingPage;
