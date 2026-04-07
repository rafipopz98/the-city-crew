import React from "react";

const OurWork = () => {
  return (
    <div
      data-scroll
      className="relative h-[22vh] lg:h-[60vh] w-full bg-[#FFF5E5] overflow-hidden flex items-center"
    >
      <h1 className="uppercase px-10 text-black nav text-[28vw] sm:text-[35vw] leading-none whitespace-nowrap">
        Our Work
      </h1>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute hidden sm:block w-[65%] h-[30%] bg-white blur-2xl opacity-90 rounded-full "
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 60%, transparent 100%)",
          }}
        ></div>
        <p className="nav2 relative text-center max-w-2xl hidden sm:block sm:text-sm lg:text-3xl font-medium text-black">
          From matchday moments to fan-driven stories.
          <br />
          See how The City Crew brings the game to life
          <br />
          every result, every reaction, every time.
        </p>
      </div>
    </div>
  );
};

export default OurWork;
