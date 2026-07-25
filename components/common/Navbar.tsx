"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "../Navbar/useScrollDirection";
import { getVisibleNavItems } from "../Navbar/nav-items";
import { HamburgerIcon, NavLink, NavbarSkeleton } from "../Navbar/NavbarParts";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className = "" }: NavbarProps) => {
  const { user, loading } = useAuth();
  const { isVisible, isAtTop } = useScrollDirection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const navItems = getVisibleNavItems(user);

  useEffect(() => setIsMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => setMobileMenuOpen(false), [pathname]);

  // Lock body scroll while the mobile menu is open, without a layout
  // shift when the scrollbar disappears.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape — was missing entirely before.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  if (!isMounted || loading) {
    return <NavbarSkeleton />;
  }

  const containerClasses = [
    "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
    "px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 sm:h-24",
    isVisible ? "translate-y-0" : "-translate-y-full",
    isHome
      ? isAtTop
        ? "bg-transparent"
        : "bg-transparent backdrop-blur-md border-b border-[#ece1cf]/10 shadow-lg"
      : "bg-[#FFF5E5] border-b border-black/10 shadow-sm",
    className,
  ].join(" ");

  const buttonStyle = isHome
    ? "text-[#ece1cf] border-[#ece1cf]/20"
    : "text-black border-black/20";

  return (
    <nav
      className={containerClasses}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className="flex items-center justify-center h-10 sm:h-12 px-3 sm:px-4 rounded-[5px] hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#e09225] z-50"
        aria-label="Home"
      >
        <img
          src={isHome ? "/logo.png" : "/logo-dark.png"}
          alt="Logo"
          width={120}
          height={48}
          className="h-full w-auto object-contain"
        />
      </Link>

      {/* Desktop nav */}
      <div
        className="hidden lg:flex items-center gap-4 xl:gap-6"
        role="menubar"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
            variant="default"
            className={buttonStyle}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Desktop user actions */}
      <div className="hidden lg:flex items-center gap-3">
        {user ? (
          <>
            <span className="bg-[#e09225] text-[#FFF5E5] font-bold px-3 py-1.5 rounded-[5px] capitalize shadow-lg text-sm">
              Hi, {user.first_name}
            </span>
            {user.role === "admin" && (
              <NavLink
                href="/admin/dashboard"
                isActive={pathname === "/admin/dashboard"}
                variant="cta"
                className="px-3 py-1.5"
              >
                Admin Dashboard
              </NavLink>
            )}
          </>
        ) : (
          <NavLink
            href="/login"
            isActive={false}
            variant="cta"
            className="px-3 py-1.5"
          >
            Login
          </NavLink>
        )}
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        className="lg:hidden flex items-center gap-2 bg-[#e09225] text-[#FFF5E5] px-4 py-2.5 rounded-[5px] uppercase font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#e09225] focus:ring-offset-2 z-50"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <HamburgerIcon isOpen={mobileMenuOpen} />
        <span className="hidden sm:inline">
          {mobileMenuOpen ? "Close" : "Menu"}
        </span>
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            className="absolute top-full left-0 w-full bg-[#06182e]/95 backdrop-blur-md border-t border-white/10 flex flex-col items-center gap-3 py-6 sm:py-8 lg:hidden z-50 shadow-2xl max-h-[80vh] overflow-y-auto"
            role="menu"
          >
            <div className="w-full px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  isActive={pathname === item.href}
                  variant="mobile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="w-full px-4 sm:px-6 max-w-2xl mx-auto mt-4 pt-4 border-t border-white/10">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-auto text-center bg-[#e09225] text-[#FFF5E5] py-3 px-6 rounded-[5px] font-bold text-sm">
                    Hi, {user.first_name}
                  </div>
                  {user.role === "admin" && (
                    <NavLink
                      href="/admin/dashboard"
                      isActive={pathname === "/admin/dashboard"}
                      variant="mobile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-[#06182e]! border-2 border-[#e09225] w-full sm:w-auto px-3 py-1.5"
                    >
                      Admin Dashboard
                    </NavLink>
                  )}
                </div>
              ) : (
                <NavLink
                  href="/login"
                  isActive={false}
                  variant="mobile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
