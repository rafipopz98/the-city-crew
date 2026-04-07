import HeroSection from "../components/Landing-Page/HeroSection";
import MatchesSection from "../components/Landing-Page/MatchSection";
import OurWork from "../components/Landing-Page/OurWork";
import Projects from "../components/Landing-Page/Projects";
import Socials from "../components/Landing-Page/Socials";
import StandingsSection from "../components/Landing-Page/StandingSection";

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <MatchesSection />
      <StandingsSection />
      <OurWork />
      <Projects />
      {/* <BuildXI /> */}
      <Socials />
    </>
  );
};

export default LandingPage;
