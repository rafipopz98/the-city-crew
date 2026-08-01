import ProfilePage from "@/components/Profile/ProfilePage";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My Profile",
  description:
    "Your City Crew profile — daily challenge history, TCC Manager career stats and player ratings, all in one place.",
  path: "/profile",
});

export default function Page() {
  return <ProfilePage />;
}
