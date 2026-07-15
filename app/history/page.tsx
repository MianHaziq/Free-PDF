import type { Metadata } from "next";

import { HistoryPanel } from "@/features/history/components/HistoryPanel";

export const metadata: Metadata = {
  title: "History",
  description:
    "Saved resumes, job descriptions, and tailored resumes with their ATS scores, per docs/DATA_MODEL.md.",
};

export default function HistoryPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">History</h1>
      <HistoryPanel />
    </main>
  );
}
