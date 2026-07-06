import Blogs from "@/components/Blogs/Blogs";
import { createMetadata } from "@/lib/seo";

const BlogsPage = () => {
  return <Blogs />;
};

export default BlogsPage;

export const metadata = createMetadata({
  title: "Manchester City Blogs & Match Analysis",
  description:
    "Read the latest Manchester City news, match analysis, transfer rumours, tactical breakdowns and fan opinions from The City Crew.",
  path: "/blogs",
  keywords: [
    "Manchester City blog",
    "Manchester City news",
    "MCFC blog",
    "Premier League news",
    "Manchester City analysis",
    "Manchester City transfers",
  ],
});
