"use client";

import { useState } from "react";
import { NAV_LINKS } from "@/components/shell/nav-links";
import { NavItem } from "@/components/shell/nav-item";

export function SidebarToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-sidebar"
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
      >
        <span className="sr-only">Toggle navigation</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-sidebar"
          className="fixed inset-0 top-14 z-40 bg-background"
        >
          <nav className="flex flex-col gap-1 p-4">
            {NAV_LINKS.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
