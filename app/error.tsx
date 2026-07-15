"use client"; // Next.js error boundaries must be client components

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Root error boundary (docs/AI_RULES.md "Error Handling: handle
 * unexpected errors, always display meaningful messages"). Catches any
 * uncaught render/runtime error in a route so the app degrades to a
 * recoverable screen instead of a blank page.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaced to the console for local debugging; there's no backend to report to.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        An unexpected error occurred. Your saved resumes and drafts are stored locally and are
        unaffected. You can try again, and if it keeps happening, reload the page.
      </p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
