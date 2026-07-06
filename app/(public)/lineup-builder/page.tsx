import BuildXI from "@/components/BuildXI/BuildXI";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Manchester City Lineup Builder | Build Your Dream XI",
  description:
    "Create and share your Manchester City starting XI. Drag and drop players, choose formations, download your lineup, and share it with other City fans.",
  path: "/lineup-builder",
  keywords: [
    "Manchester City lineup builder",
    "Build Manchester City XI",
    "Manchester City formation",
    "Manchester City squad builder",
    "MCFC lineup",
    "Manchester City starting XI",
    "Manchester City team builder",
  ],
});

export default function LineupBuilderPage() {
  return (
    <div className="w-full min-h-screen bg-[#FFF5E5] px-6 md:px-12 lg:px-16 pt-38">
      <BuildXI />
    </div>
  );
}
