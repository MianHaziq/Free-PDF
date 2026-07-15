"use client"; // useEffect only runs on the client, which is exactly the signal this hook needs

import { useEffect, useState } from "react";

/**
 * True only after the client has mounted (i.e. after hydration
 * completes). Server-rendered HTML has no IndexedDB, so any component
 * reading a Zustand `persist`-backed store (features/resume-editor/store.ts,
 * features/job-description/store.ts) can render different content on the
 * server (no persisted data yet) vs. the client's very first paint
 * (persisted data may already be rehydrated) — a real React hydration
 * mismatch, not just a cosmetic flash. Gate that content behind this hook
 * so both the server and the client's first render agree (render nothing),
 * and only switch to real data in a subsequent, ordinary re-render.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Deliberate: an effect is the only way to detect "we're past the
    // client's first paint" — this is the standard React hydration-safety
    // pattern, not a case the set-state-in-effect rule is meant to catch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}
