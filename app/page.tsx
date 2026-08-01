import Navbar from "@/components/common/Navbar";
import HeroSection from "../components/Landing-Page/HeroSection";
import MatchesSection from "../components/Landing-Page/MatchSection";
import OurWork from "../components/Landing-Page/OurWork";
import Projects from "../components/Landing-Page/Projects";
import StandingsSection from "../components/Landing-Page/StandingSection";
import { createMetadata } from "@/lib/seo";
import Footer from "@/components/common/Footer";
import { PwaInstallPrompt } from "@/components/common/PwaInstallPrompt";
import { DailyChallengeBanner } from "@/components/common/DailyChallengeBanner";
import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <MatchesSection />
      <StandingsSection />
      <OurWork />
      <Projects />
      <Footer />
      <PwaInstallPrompt />
      <DailyChallengeBanner />
      <CompleteProfileModal />
    </>
  );
};

export default LandingPage;

export const metadata = createMetadata({
  title: "Manchester City News, Blogs & Fan Community | The City Crew",
  description:
    "The City Crew is home to Manchester City news, match previews, player stats, fan polls, lineup builder, matchday content, and in-depth blogs for City supporters.",
  path: "/",
  keywords: [
    "Manchester City",
    "Manchester City news",
    "MCFC",
    "Manchester City blog",
    "Manchester City fan community",
    "Premier League",
    "Manchester City lineup",
    "Manchester City polls",
  ],
});
