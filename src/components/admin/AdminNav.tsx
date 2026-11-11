"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const LINKS = [
  { href: "/admin", label: "Dashboard", icon: I("M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10") },
  { href: "/admin/orders", label: "Orders", icon: I("M6 2l-2 4v14a2 2 0 002 2h12a2 2 0 002-2V6l-2-4zM4 6h16M16 10a4 4 0 01-8 0") },
  { href: "/admin/pages", label: "Pages", icon: I("M4 5h16M4 12h16M4 19h16") },
  { href: "/admin/products", label: "Products & price", icon: I("M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7.5 7.5h.01") },
  { href: "/admin/editor", label: "Theme editor", icon: I("M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4a3.1 3.1 0 003.1-3.1C20.5 6.7 16.7 3 12 3zM7.5 12h.01M9 8h.01M14 7.5h.01") },
  { href: "/admin/settings", label: "Settings", icon: I("M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z") },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Admin">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className="admin-navlink">
            {l.icon}
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
