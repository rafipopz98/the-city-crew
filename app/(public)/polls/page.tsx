import Polls from "@/components/Polls/Polls";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Manchester City Fan Polls & Matchday Votes",
  description:
    "Vote in Manchester City fan polls, predict lineups, share opinions, and see how fellow City supporters are voting on The City Crew.",
  path: "/polls",
  keywords: [
    "Manchester City polls",
    "Manchester City fan vote",
    "MCFC polls",
    "Manchester City predictions",
    "Manchester City fan opinions",
    "Manchester City voting",
    "Manchester City match polls",
  ],
});

export default function PollsPage() {
  return <Polls />;
}
