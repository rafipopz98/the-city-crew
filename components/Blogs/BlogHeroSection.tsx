"use client";

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
  <section className="relative w-full h-[70vh] lg:h-[90vh] bg-[#FFF5E5] overflow-hidden flex items-center">
    {/* Big Text Skeleton */}
    <div className="px-6 sm:px-10 lg:px-16 z-10 animate-pulse">
      <div className="h-[22vw] sm:h-[18vw] w-[60vw] bg-black/10 rounded mb-2" />
      <div className="h-[22vw] sm:h-[18vw] w-[80vw] bg-black/10 rounded" />
    </div>

    {/* Featured Card Skeleton */}
    <div className="absolute right-0 sm:right-[5%] top-[20%] sm:top-[25%] w-[75%] sm:w-[45%] lg:w-[40%] animate-pulse">
      <div className="h-[45vh] sm:h-[55vh] bg-gray-200 rounded overflow-hidden">
        <div className="h-full w-full bg-linear-to-br from-gray-300 to-gray-200" />
      </div>
      <div className="mt-4 px-2 space-y-2">
        <div className="h-6 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  </section>
);

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface FeaturedBlogCardProps {
  blog: Blog;
}

export const FeaturedBlogCard = ({ blog }: FeaturedBlogCardProps) => (
  <Link
    href={`/blogs/${blog.slug}`}
    className="
      absolute
      right-0 sm:right-[5%] lg:right-[8%]
      top-[20%] sm:top-[25%]
      w-[75%] sm:w-[45%] lg:w-[40%]
      group
    "
  >
    {/* Image Container */}
    <div className="relative h-[40vh] xs:h-[45vh] sm:h-[50vh] lg:h-[55vh] bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl transition-shadow duration-300 group-hover:shadow-2xl">
      {/* Corner Decorations */}
      <div className="absolute inset-0 flex flex-col justify-between z-10 pointer-events-none">
        <div className="flex justify-between">
          <span className="ml-3 sm:ml-4 mt-3 sm:mt-4 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full opacity-70" />
          <span className="mr-3 sm:mr-4 mt-3 sm:mt-4 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full opacity-70" />
        </div>
        <div className="flex justify-between">
          <span className="ml-3 sm:ml-4 mb-3 sm:mb-4 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full opacity-70" />
          <span className="mr-3 sm:mr-4 mb-3 sm:mb-4 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white rounded-full opacity-70" />
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-[#e09225] opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-5" />

      {/* Image */}
      <Image
        src={blog.thumbnail}
        alt={blog.title}
        fill
        sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 40vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 z-0"
        priority
      />

      {/* Read More Overlay on Mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent z-10 sm:hidden">
        <span className="text-white text-sm font-medium flex items-center gap-1">
          Read Article
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="mt-3 sm:mt-4 px-1 sm:px-2">
      <h3 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-semibold uppercase leading-tight group-hover:text-[#e09225] transition-colors duration-300 line-clamp-2">
        {blog.title}
      </h3>

      {/* Desktop Read More */}
      <div className="hidden sm:flex items-center gap-1 mt-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>Read Article</span>
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </div>
  </Link>
);

type Props = {
  blog?: Blog;
  isLoading?: boolean;
};

export default function BlogHeroSection({ blog, isLoading }: Props) {
  // Loading State
  if (isLoading) {
    return <BlogHeroSkeleton />;
  }

  // Empty State
  if (!blog) {
    return (
      <section className="relative w-full h-[70vh] lg:h-[90vh] bg-[#FFF5E5] overflow-hidden flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl sm:text-4xl lg:text-4xl font-bold uppercase text-black/20">
            City Stories
          </h1>
          <p className="mt-4 text-gray-400 text-sm sm:text-base">
            No featured story available at the moment
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[70vh] lg:h-[90vh] bg-[#FFF5E5] overflow-hidden flex items-center">
      {/* Background Big Text */}
      <div className="px-6 sm:px-10 lg:px-16 z-10 select-none">
        <h1 className="text-[15vw] xs:text-[17vw] sm:text-[13vw] lg:text-[11vw] leading-none uppercase text-black font-bold tracking-tighter">
          City
        </h1>
        <h1 className="text-[15vw] xs:text-[17vw] sm:text-[13vw] lg:text-[11vw] leading-none uppercase text-black font-bold tracking-tighter -mt-4 xs:-mt-6 sm:-mt-8 lg:-mt-10">
          Stories
        </h1>
      </div>

      {/* Featured Blog Card */}
      <FeaturedBlogCard blog={blog} />
    </section>
  );
}
