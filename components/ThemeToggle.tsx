"use client"; // reads/sets the active theme + needs post-hydration mount gating

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Light/dark toggle. The resolved theme isn't known during SSR, so the
 * icon is gated behind useHasMounted to avoid a hydration mismatch — a
 * fixed-size placeholder holds the layout until then.
 */
export function ThemeToggle() {
  const hasMounted = useHasMounted();
  const { resolvedTheme, setTheme } = useTheme();

  if (!hasMounted) {
    return <div className="size-7" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
