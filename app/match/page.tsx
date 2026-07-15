import type { Metadata } from "next";

import { MatchResultPanel } from "@/features/matching-engine/components/MatchResultPanel";

export const metadata: Metadata = {
  title: "Match",
  description:
    "See how your resume matches the job description's required and preferred skills, with an ATS score and recommendations.",
};

export default function MatchPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Resume ↔ Job Match</h1>
      <MatchResultPanel />
    </main>
  );
}
