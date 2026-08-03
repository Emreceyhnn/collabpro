export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents/welcome", label: "Documents" },
  { href: "/settings", label: "Settings" },
  { href: "/settings/audit-logs", label: "Audit Logs" },
  { href: "/health", label: "System Health" },
];
