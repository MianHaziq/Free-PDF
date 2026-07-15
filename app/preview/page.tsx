import type { Metadata } from "next";

import { ResumePreview } from "@/features/resume-preview/components/ResumePreview";

export const metadata: Metadata = {
  title: "Preview",
  description:
    "A live, print-friendly resume preview with a choice of templates, and a toggle between your current resume and the version tailored for the job description.",
};

export default function PreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 print:p-0">
      <h1 className="text-2xl font-bold tracking-tight print:hidden">Resume Preview</h1>
      <ResumePreview />
    </main>
  );
}
