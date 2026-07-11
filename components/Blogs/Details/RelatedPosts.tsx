import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RelatedPost } from "./types";

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-3xl md:text-4xl font-bold text-[#06182e] mb-10">
          Related Stories
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post._id} href={`/blogs/${post.slug}`} className="group">
              <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-[#06182e] group-hover:text-[#e09225] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-[#06182e]/50 mt-2 line-clamp-2">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-[#e09225] mt-3 font-medium">
                Read More
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
