import type { Metadata } from "next";
import BlogDetails from "@/components/Blogs/BlogDetails";
import { SITE_CONFIG } from "@/lib/site";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${SITE_CONFIG.url}/api/blogs/public/${slug}`, {
      cache: "no-store",
    });

    const data = await res.json();

    const blog = data.blog;

    if (!blog) {
      return {
        title: "Blog Not Found | The City Crew",
      };
    }

    return {
      title: blog.title,
      description: blog.excerpt,
      keywords: blog.tags,

      alternates: {
        canonical: `${SITE_CONFIG.url}/blogs/${slug}`,
      },

      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `${SITE_CONFIG.url}/blogs/${slug}`,
        siteName: SITE_CONFIG.name,
        images: [
          {
            url: blog.thumbnail,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: "article",
      },

      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
        images: [blog.thumbnail],
      },
    };
  } catch {
    return {
      title: "The City Crew",
    };
  }
}

export default function BlogDetailsPage({ params }: Props) {
  return <BlogDetails params={params} />;
}
