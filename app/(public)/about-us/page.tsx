import About from "@/components/About/About";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About The City Crew",
  description:
    "Learn about The City Crew, a Manchester City fan community built by supporters for supporters. Meet the team behind the blogs, matchday coverage, polls, and fan content.",
  path: "/about-us",
  keywords: [
    "About The City Crew",
    "Manchester City fan community",
    "Manchester City supporters",
    "MCFC fans",
    "Manchester City blog",
  ],
});

export default function AboutUsPage() {
  return <About />;
}
