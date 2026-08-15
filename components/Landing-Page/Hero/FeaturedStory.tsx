import Image from "next/image";
import Link from "next/link";
import { BlogData } from "./types-hero";

interface FeaturedStoryProps {
  blog: BlogData;
}

export const FeaturedStory = ({ blog }: FeaturedStoryProps) => (
  <div className="lg:col-span-2 relative w-full h-[60vh] xs:h-[60vh] sm:h-[40vh] md:h-[40vh] lg:h-[56vh] rounded-xl overflow-hidden group">
    <Image
      src={blog.thumbnail}
      alt={blog.title || "Featured Manchester City article"}
      fill
      priority
      sizes="(max-width:768px) 100vw, (max-width:1200px) 66vw, 66vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />

    <div className="absolute inset-0 bg-linear-to-t from-[#06182e] via-[#06182e]/70 to-transparent" />

    <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 lg:p-10">
      <h1 className="uppercase text-[6vw] sm:text-[4vw] lg:text-[3rem] leading-[0.9] font-bold text-white line-clamp-3">
        {blog.title}
      </h1>

      <div className="flex flex-wrap gap-3 mt-5">
        <Link
          href="/matches"
          className="bg-[#e09225] text-black font-bold px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm transition-all hover:bg-[#f2a63b] hover:shadow-lg hover:shadow-[#e09225]/20"
        >
          Fixtures
        </Link>

        {blog.slug && (
          <Link
            href={`/blogs/${blog.slug}`}
            className="border border-[#ece1cf]/30 text-[#ece1cf] px-4 sm:px-5 py-2 rounded-[5px] uppercase text-xs sm:text-sm hover:bg-[#e09225] hover:text-black hover:border-[#e09225] transition-all inline-flex items-center justify-center"
          >
            Read Full Story
          </Link>
        )}
      </div>
    </div>
  </div>
);
