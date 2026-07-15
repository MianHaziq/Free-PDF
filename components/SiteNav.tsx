import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/editor", label: "Resume Editor" },
  { href: "/job-description", label: "Job Description" },
  { href: "/match", label: "Match" },
  { href: "/preview", label: "Preview" },
  { href: "/history", label: "History" },
];

/** Minimal top-level nav — no active-link state needed yet, so this stays a server component (the theme toggle is an isolated client child). Hidden entirely when printing (e.g. the resume preview page), never something you'd want on a printed page. */
export function SiteNav() {
  return (
    <nav aria-label="Main" className="border-b border-input px-6 py-3 print:hidden">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground/70 hover:text-foreground focus-visible:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
}
