import { Link, useLocation } from "@tanstack/react-router";
import type { SVGProps } from "react";
import { Bell, BookOpen, Headphones, Search, type LucideIcon } from "lucide-react";

/** Solid house with a light door, as in the supplied bar design. */
function HomeSolid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="none">
      <path d="M3.2 10.4 12 3.2l8.8 7.2V20a1.2 1.2 0 0 1-1.2 1.2H4.4A1.2 1.2 0 0 1 3.2 20Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="9.6" y="13.2" width="4.8" height="8" rx="0.9" className="bottom-navigation-door" />
    </svg>
  );
}

/**
 * Curved (arch-shaped) bottom bar. Item positions are percentages of the arch
 * drawing below (viewBox 400 x 175) so the icons sit on the middle of the band.
 */
const items: ReadonlyArray<{ to: string; label: string; icon: LucideIcon | typeof HomeSolid; tone: string; x: number; y: number; filled?: boolean; center?: boolean }> = [
  { to: "/", label: "الصفحة الرئيسية", icon: HomeSolid, tone: "home", x: 85.6, y: 64 },
  { to: "/illuminated-book", label: "الكتاب المضيئ", icon: BookOpen, tone: "book", x: 69.6, y: 40.5 },
  { to: "/quran-audio", label: "القرآن المرتل", icon: Headphones, tone: "audio", x: 50, y: 31, center: true },
  { to: "/notifications", label: "الإشعارات", icon: Bell, tone: "bell", x: 30.4, y: 40.5, filled: true },
  { to: "/search", label: "البحث", icon: Search, tone: "search", x: 14.4, y: 64 },
];

const ARCH =
  "M 22 132 C 85 -12, 315 -12, 378 132 A 19.5 19.5 0 0 1 350 158 C 300 70, 100 70, 50 158 A 19.5 19.5 0 0 1 22 132 Z";

export function BottomNavigation() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <nav className={`bottom-navigation ${pathname === "/" ? "bottom-navigation--home" : ""}`} aria-label="التنقل السفلي" dir="rtl">
      <svg className="bottom-navigation-arch" viewBox="0 0 400 175" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="nav-arch-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--nav-arch-top)" />
            <stop offset="100%" stopColor="var(--nav-arch-bottom)" />
          </linearGradient>
        </defs>
        <path d={ARCH} className="bottom-navigation-arch-fill" fill="url(#nav-arch-fill)" />
        <path d={ARCH} className="bottom-navigation-arch-shine" transform="translate(0 2.2)" />
      </svg>
      {items.map(({ to, label, icon: Icon, tone, x, y, filled, center }) => {
        const active = to === "/" ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={`bottom-navigation-item bottom-navigation-item--${tone} ${center ? "bottom-navigation-item--center" : ""} ${active ? "bottom-navigation-item--active" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Icon aria-hidden="true" fill={filled ? "currentColor" : "none"} />
          </Link>
        );
      })}
    </nav>
  );
}
