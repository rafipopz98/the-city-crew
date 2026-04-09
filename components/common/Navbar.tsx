"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsAtTop(currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const navBgClass = isHome
    ? isAtTop
      ? "bg-transparent"
      : "bg-transparent backdrop-blur-md border-b border-[#ece1cf]/10 shadow-lg"
    : "bg-[#FFF5E5] border-b border-black/10 shadow-sm";

  const textColor = isHome ? "text-[#ece1cf]" : "text-black";

  const buttonStyle = isHome
    ? "bg-transparent text-[#ece1cf] border-[#ece1cf]/20"
    : "bg-transparent text-black border-black/20";

  const navItems = ["blogs", "polls", "about-us", "player-stats"];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out px-4 sm:px-8 flex items-center justify-between
      h-20 sm:h-24 ${isVisible ? "translate-y-0" : "-translate-y-full"} ${navBgClass}`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center h-10 sm:h-12 px-3 sm:px-4 rounded-[5px] hover:scale-105 transition-transform"
      >
        <img
          src={isHome ? "/logo.png" : "/logo-dark.png"}
          alt="Logo"
          className="h-full w-auto object-contain"
        />
      </Link>

      {/* Desktop Links */}
      <div
        className={`hidden md:flex gap-6 text-[13px] font-bold ${textColor}`}
      >
        {navItems.map((item) => {
          const isActive = pathname === `/${item}`;

          return (
            <Link
              key={item}
              href={`/${item}`}
              className={`${buttonStyle} border rounded-[5px] py-2 px-4 uppercase transition-all duration-300 hover:-rotate-6 shadow-sm hover:bg-[#e09225] hover:text-[#FFF5E5] ${
                isActive ? "bg-[#e09225] text-black border-[#e09225]" : ""
              }`}
            >
              {item.replace("-", " ")}
            </Link>
          );
        })}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex">
        <Link
          href="/login"
          className="bg-[#e09225] text-[#FFF5E5] font-bold px-3 py-1.5 rounded-[5px] uppercase shadow-lg hover:scale-105 transition-all"
        >
          Login
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden bg-[#e09225] text-[#FFF5E5] px-4 py-2 rounded-[5px] uppercase"
      >
        Menu
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#06182e] border-t border-black flex flex-col items-center gap-4 md:hidden py-4">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/${item}`}
              className="w-11/12 text-center bg-[#e09225] text-[#FFF5E5] py-2 uppercase rounded-[5px]"
              onClick={() => setMenuOpen(false)}
            >
              {item.replace("-", " ")}
            </Link>
          ))}

          <Link
            href="/login"
            className="w-11/12 text-center bg-[#e09225] text-[#FFF5E5] py-2 uppercase rounded-[5px]"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
