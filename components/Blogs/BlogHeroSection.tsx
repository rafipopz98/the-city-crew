const BlogHeroSection = () => {
  return (
    <section className="relative w-full h-[70vh] lg:h-[90vh] bg-[#FFF5E5] overflow-hidden flex items-center">
      {/* BIG TEXT LEFT */}
      <div className="px-6 sm:px-10 z-10">
        <h1 className="head text-[22vw] sm:text-[18vw] leading-none uppercase text-black">
          City
        </h1>
        <h1 className="head text-[22vw] sm:text-[18vw] leading-none uppercase text-black -mt-6 sm:-mt-10">
          Stories
        </h1>
      </div>

      {/* FEATURED BLOG (RIGHT SIDE - OFFSET) */}
      <div className="absolute right-[-10%] sm:right-[5%] top-[20%] sm:top-[25%] w-[75%] sm:w-[40%]">
        <div className="relative group h-[45vh] sm:h-[55vh] bg-black rounded overflow-hidden shadow-xl">
          {/* corner dots */}
          <div className="absolute inset-0 flex flex-col justify-between z-10">
            <div className="flex justify-between">
              <span className="ml-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
              <span className="mr-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
            </div>
            <div className="flex justify-between">
              <span className="ml-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
              <span className="mr-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
            </div>
          </div>

          {/* overlay */}
          <div className="absolute inset-0 bg-[#e09225] opacity-0 group-hover:opacity-20 transition duration-500"></div>

          {/* image */}
          <img
            src="https://i.pinimg.com/736x/c9/4a/71/c94a71578e67f3bdee0d8e65e13ca52f.jpg"
            alt="featured blog"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-90 transition-all duration-500"
          />
        </div>

        {/* TEXT */}
        <div className="mt-4 px-2">
          <h3 className="nav text-xl sm:text-2xl uppercase">
            Inside the Matchday Chaos
          </h3>
          <p className="nav para text-sm sm:text-base mt-1 max-w-md">
            What it really feels like inside the city when the game takes over.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogHeroSection;
