import Link from "next/link";
import type { ReactNode } from "react";
import { NAV_LINKS } from "@/components/shell/nav-links";
import { NavItem } from "@/components/shell/nav-item";
import { SidebarToggle } from "@/components/shell/sidebar-toggle";

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <Link href="/dashboard" className="text-h4 font-semibold">
          CollabPro
        </Link>
        <SidebarToggle />
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
