const Socials = () => {
  return (
    <section className="nav w-full bg-[#FBF2E1] px-6 text-[#1a0010] font-bold uppercase">
      {/* Mobile Layout */}
      <div className="flex gap-4 items-center justify-between sm:hidden">
        {/* Top Row */}
        <p>tcc@gmail.com</p>

        {/* Bottom Row */}
        <p className="text-center text-sm leading-snug">
          Copyright {new Date().getFullYear()} all rights reserved
        </p>
        <p>Twitter</p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex sm:justify-between sm:items-end">
        <p className="text-lg lg:text-4xl">tcc@gmail.com</p>

        <p className="text-lg lg:text-4xl text-center">Twitter</p>

        <p className="text-lg lg:text-4xl text-right">
          Copyright {new Date().getFullYear()} all rights reserved
        </p>
      </div>
    </section>
  );
};

export default Socials;
