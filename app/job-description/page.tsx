import type { Metadata } from "next";

import { SaveStatusIndicator } from "@/components/SaveStatusIndicator";
import { SaveJobDescriptionButton } from "@/features/history/components/SaveJobDescriptionButton";
import { JobDescriptionForm } from "@/features/job-description/components/JobDescriptionForm";
import { PasteOrUploadPanel } from "@/features/job-description/components/PasteOrUploadPanel";

export const metadata: Metadata = {
  title: "Job Description",
  description:
    "Paste or upload a job description to extract its title, company, and keywords for resume tailoring, with auto-save.",
};

export default function JobDescriptionPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Job Description</h1>
        <div className="flex items-center gap-3">
          <SaveStatusIndicator />
          <SaveJobDescriptionButton />
        </div>
      </div>
      <PasteOrUploadPanel />
      <JobDescriptionForm />
    </main>
  );
}
