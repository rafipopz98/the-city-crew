import BlogCards from "./BlogCards";
import BlogHeroSection from "./BlogHeroSection";

const Blogs = () => {
  return (
    <div className="w-full bg-[#FFF5E5]">
      <BlogHeroSection />

      {/* SEARCH */}
      <div className="w-full px-5 sm:px-10 py-6 flex justify-center">
        <div className="w-full max-w-2xl flex items-center border border-black rounded-full px-5 py-3">
          <input
            type="text"
            placeholder="Search stories..."
            className="w-full bg-transparent outline-none para text-sm sm:text-base"
          />

          <span className="para text-sm uppercase cursor-pointer ml-4">
            Search
          </span>
        </div>
      </div>

      <BlogCards />
    </div>
  );
};

export default Blogs;
