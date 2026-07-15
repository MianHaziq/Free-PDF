import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/editor", label: "Resume Editor" },
  { href: "/job-description", label: "Job Description" },
  { href: "/match", label: "Match" },
  { href: "/preview", label: "Preview" },
];

/** Minimal top-level nav — no active-link state needed yet, so this stays a server component. Hidden entirely when printing (e.g. the resume preview page), never something you'd want on a printed page. */
export function SiteNav() {
  return (
    <nav aria-label="Main" className="border-b border-input px-6 py-3 print:hidden">
      <ul className="mx-auto flex w-full max-w-3xl gap-4 text-sm font-medium">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-foreground/70 hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
