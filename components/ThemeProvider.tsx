"use client"; // next-themes reads/writes localStorage + the <html> class on the client

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper over next-themes so the root layout (a server component)
 * can stay server-rendered while only this provider opts into the client.
 * Uses the `class` strategy to toggle `.dark` on <html>, which drives the
 * oklch design tokens in app/globals.css.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
