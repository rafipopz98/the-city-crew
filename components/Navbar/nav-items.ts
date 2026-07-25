export interface NavItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Blogs", href: "/blogs" },
  { label: "TCC Quiz", href: "/daily-challenge" },
  { label: "About Us", href: "/about-us" },
  { label: "Player Stats", href: "/player-stats" },
  { label: "Matches", href: "/matches" },
  { label: "Game", href: "/game" },
  { label: "Lineup Builder", href: "/lineup-builder" },
];

/**
 * The old component defined `requiresAuth` / `adminOnly` on NavItem but
 * never actually used them — every item rendered for every visitor.
 * This makes that filtering real.
 */
export function getVisibleNavItems(
  user: { role?: string } | null | undefined,
): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") return false;
    if (item.requiresAuth && !user) return false;
    return true;
  });
}
