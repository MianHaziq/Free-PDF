import type { Metadata } from "next";

import { CertificationsSection } from "@/features/resume-editor/components/CertificationsSection";
import { ContactSection } from "@/features/resume-editor/components/ContactSection";
import { EducationSection } from "@/features/resume-editor/components/EducationSection";
import { ExperienceSection } from "@/features/resume-editor/components/ExperienceSection";
import { ImportDropzone } from "@/features/resume-editor/components/ImportDropzone";
import { ProjectsSection } from "@/features/resume-editor/components/ProjectsSection";
import { SaveStatusIndicator } from "@/features/resume-editor/components/SaveStatusIndicator";
import { SkillsSection } from "@/features/resume-editor/components/SkillsSection";
import { SummarySection } from "@/features/resume-editor/components/SummarySection";
import { UnclassifiedBlocksPanel } from "@/features/resume-editor/components/UnclassifiedBlocksPanel";

export const metadata: Metadata = {
  title: "Resume Editor",
  description:
    "Review and edit your imported or blank resume: contact info, summary, skills, experience, projects, education, and certifications, with auto-save.",
};

export default function EditorPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Resume Editor</h1>
        <SaveStatusIndicator />
      </div>
      <ImportDropzone />
      <UnclassifiedBlocksPanel />
      <ContactSection />
      <SummarySection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <CertificationsSection />
    </main>
  );
}
