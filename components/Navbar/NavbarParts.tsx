import Link from "next/link";

import { Menu, X } from "lucide-react";

export const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => {
  const Icon = isOpen ? X : Menu;

  return (
    <Icon size={24} strokeWidth={2} className="transition-all duration-300" />
  );
};

type NavLinkVariant = "default" | "cta" | "mobile";

const VARIANT_STYLES: Record<NavLinkVariant, string> = {
  default:
    "py-2 px-4 text-[13px] xl:text-sm border hover:-rotate-6 hover:bg-[#e09225] hover:text-[#FFF5E5]",
  cta: "px-3 py-1.5 bg-[#e09225] text-[#FFF5E5] shadow-lg hover:scale-105",
  mobile:
    "w-full max-w-md text-center py-3 bg-[#e09225] text-[#FFF5E5] text-sm sm:text-base hover:bg-[#c97f1e] active:scale-95",
};

export const NavLink = ({
  href,
  children,
  isActive,
  variant = "default",
  onClick,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  variant?: NavLinkVariant;
  onClick?: () => void;
  className?: string;
}) => (
  <Link
    href={href}
    onClick={onClick}
    role="menuitem"
    className={[
      "rounded-[5px] uppercase font-bold transition-all duration-300",
      VARIANT_STYLES[variant],
      isActive && variant === "default"
        ? "bg-[#e09225] text-black border-[#e09225]"
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    aria-current={isActive ? "page" : undefined}
  >
    {children}
  </Link>
);

export const NavbarSkeleton = () => (
  <nav
    className="fixed top-0 left-0 w-full z-50 h-20 sm:h-24 bg-transparent border-b border-black/10"
    aria-hidden="true"
  >
    <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
      <div className="h-10 sm:h-12 w-32 bg-gray-800 opacity-15 animate-pulse rounded" />
      <div className="flex-1" />
      <div className="h-8 w-24 bg-gray-800 opacity-15  animate-pulse rounded" />
    </div>
  </nav>
);
