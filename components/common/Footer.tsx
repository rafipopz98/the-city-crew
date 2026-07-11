import Image from "next/image";
import Link from "next/link";
import { Circle, CircuitBoard, MessageCircle } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Blogs", href: "/blogs" },
  { label: "Polls", href: "/polls" },
  { label: "About Us", href: "/about-us" },
  { label: "Player Stats", href: "/player-stats" },
  { label: "Matches", href: "/matches" },
  { label: "Lineup Builder", href: "/lineup-builder" },
];

export function getVisibleNavItems(
  user: { role?: string } | null | undefined,
): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const exploreLinks = NAV_ITEMS.filter((item) =>
    ["Blogs", "Matches", "Player Stats", "Lineup Builder", "Polls"].includes(
      item.label,
    ),
  );

  return (
    <footer className="bg-[#FBF2E1] text-[#14000F]">
      <div className="mx-auto max-w-7xl">
        <div
          className="
            grid

            grid-cols-1

            lg:grid-cols-[1.4fr_1fr_1fr_1fr]

          "
        >
          {/* Brand */}

          <div className="px-8 py-12 lg:px-12 lg:py-16">
            <Image
              src="/logo-dark.png"
              alt="The City Crew"
              width={70}
              height={70}
              className="object-contain"
            />

            <h2 className="mt-8 para text-5xl uppercase leading-none">
              The City Crew
            </h2>

            <div className="mt-10 flex items-center gap-5">
              <a
                href="#"
                className="
                  transition
                  hover:text-[#e09225]
                  hover:-translate-y-1
                "
              >
                <Circle size={20} />
              </a>

              <a
                href="#"
                className="
                  transition
                  hover:text-[#e09225]
                  hover:-translate-y-1
                "
              >
                <CircuitBoard size={20} />
              </a>

              <a
                href="#"
                className="
                  transition
                  hover:text-[#e09225]
                  hover:-translate-y-1
                "
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          {/* Explore */}

          <div className="px-8 py-12 lg:px-12 lg:py-16">
            <p
              className="
                text-xs

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Explore
            </p>

            <nav className="mt-8 flex flex-col gap-3">
              {exploreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    w-fit

                    text-lg

                    transition-all

                    hover:text-[#e09225]
                    hover:translate-x-1
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Community */}

          <div className="px-8 py-12 lg:px-12 lg:py-16">
            <p
              className="
                text-xs

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Community
            </p>

            <nav className="mt-8 flex flex-col gap-3">
              <Link
                href="/about-us"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Contact
              </Link>

              <a
                href="#"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Twitter / X
              </a>

              <a
                href="#"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Instagram
              </a>

              <a
                href="#"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Discord
              </a>
            </nav>
          </div>
          {/* Legal */}

          {/* <div className="px-8 py-12 lg:px-12 lg:py-16">
            <p
              className="
                text-xs

                uppercase

                tracking-[0.35em]

                text-black/40
              "
            >
              Legal
            </p>

            <nav className="mt-8 flex flex-col gap-5">
              <Link
                href="/privacy"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Terms of Service
              </Link>

              <Link
                href="/cookies"
                className="
                  w-fit

                  text-lg

                  transition-all

                  hover:text-[#e09225]
                  hover:translate-x-1
                "
              >
                Cookie Policy
              </Link>
            </nav>
          </div> */}
        </div>
      </div>

      {/* Giant Background Text */}

      <div className="relative overflow-hidden">
        <div
          className="
            flex

            h-48

            items-center

            justify-center

            lg:h-72
          "
        >
          <h2
            className="text-[13vw] sm:text-[16vw] lg:text-[13vw] font-extrabold uppercase text-[#14000F] whitespace-nowrap"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
              opacity: 0.15,
            }}
          >
            THE CITY CREW
          </h2>
        </div>
        {/* Bottom */}
        <div
          className="
            border-t

            border-black/10

            py-8
          "
        >
          <div
            className="
              mx-auto

              flex

              max-w-7xl

              flex-col

              items-center

              justify-between

              gap-4

              px-8

              text-center

              lg:flex-row

              lg:px-12

              lg:text-left
            "
          >
            <p className="text-sm text-black/45">
              © {currentYear}{" "}
              <span className="font-semibold">The City Crew</span>. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
