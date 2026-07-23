"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  readTime?: string;
}

export const BlogHeroSkeleton = () => (
  <section className="w-full bg-[#EFE7D8] overflow-hidden">
    <div className="mx-auto max-w-360 px-6 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24 animate-pulse">
      <div className="h-4 w-40 bg-black/10 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-end gap-10 lg:gap-8">
        <div className="space-y-3">
          <div className="h-[11vw] lg:h-24 w-[70%] bg-black/10 rounded-lg" />
          <div className="h-[11vw] lg:h-24 w-[55%] bg-black/10 rounded-lg" />
        </div>
        <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto bg-white p-3 pb-5">
          <div className="aspect-4/5 w-full bg-black/10" />
        </div>
      </div>
    </div>
  </section>
);

interface FeaturedBlogCardProps {
  blog: Blog;
}

export const FeaturedBlogCard = ({ blog }: FeaturedBlogCardProps) => (
  <Link
    href={`/blogs/${blog.slug}`}
    className="group w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto -rotate-2 hover:rotate-0 transition-transform duration-300"
    aria-label={`Read article: ${blog.title}`}
  >
    <div className="relative bg-white p-3 pb-5 shadow-[0_8px_0_0_rgba(0,0,0,0.06)]">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#e09225]/95 border border-[#e09225]/90 rotate-1 z-10" />
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#D8CBAE]">
        <Image
          src={blog.thumbnail}
          alt={blog.title}
          fill
          sizes="(max-width: 1024px) 90vw, 35vw"
          className="object-cover grayscale-15 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {blog.category && (
        <p className="mt-3 text-xs uppercase tracking-wide text-[#e09225] font-mono">
          {blog.category}
        </p>
      )}
      <h3 className="font-black uppercase text-lg text-[#1B1409] mt-1 leading-tight line-clamp-2 group-hover:text-[#e09225] transition-colors">
        {blog.title}
      </h3>
      <div className="mt-2 flex items-center gap-1 text-xs font-mono text-[#1B1409]/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Read article</span>
        <ArrowUpRight className="h-3 w-3" />
      </div>
    </div>
  </Link>
);

type Props = {
  blog?: Blog;
  isLoading?: boolean;
};

export default function BlogHeroZinePress({ blog, isLoading }: Props) {
  if (isLoading) return <BlogHeroSkeleton />;

  if (!blog) {
    return (
      <section className="flex w-full items-center justify-center bg-[#EFE7D8] px-6 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="font-black uppercase text-2xl sm:text-4xl text-[#1B1409]/15">
            City Stories
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#1B1409]/40">
            No featured story available at the moment
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden pt-4">
      <div className="mx-auto max-w-360 px-6 sm:px-10 lg:px-16 pt-14 sm:pt-20 lg:pt-24">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-[#e09225] font-medium">
            Est. block by block
          </span>
          <div
            className="flex-1 h-px opacity-40"
            style={{
              backgroundImage: "radial-gradient(#1B1409 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
          {blog.readTime && (
            <span className="font-mono text-xs uppercase tracking-widest text-[#1B1409]/50">
              {blog.readTime}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-end gap-10 lg:gap-8">
          <h1 className="font-black uppercase text-[#1B1409] leading-[0.82] text-[clamp(2.75rem,11vw,6rem)] select-none">
            <div>City</div>
            <div>
              Stor<span className="text-[#e09225]">ies</span>
            </div>
          </h1>

          <FeaturedBlogCard blog={blog} />
        </div>

        {blog.excerpt && (
          <p className="mt-8 max-w-md text-[#1B1409]/70 text-sm leading-relaxed font-mono">
            {blog.excerpt}
          </p>
        )}
      </div>
    </section>
  );
}
