import BlogDetails from "@/components/Blogs/BlogDetails";

const BlogDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  return <BlogDetails params={params} />;
};

export default BlogDetailsPage;
