"use client"; // loads + mutates the IndexedDB-backed history store

import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoryStore } from "@/features/history/store";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useHasMounted } from "@/hooks/useHasMounted";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Phase 13's history view: the persisted (not just auto-saved-draft)
 * SourceResume/JobDescription/TailoredResume records, with the
 * TailoredResume list grouped by source resume + job description + ATS
 * score per docs/DATA_MODEL.md's stated goal for this view.
 */
export function HistoryPanel() {
  const hasMounted = useHasMounted();
  const isLoaded = useHistoryStore((state) => state.isLoaded);
  const sourceResumes = useHistoryStore((state) => state.sourceResumes);
  const jobDescriptions = useHistoryStore((state) => state.jobDescriptions);
  const tailoredResumes = useHistoryStore((state) => state.tailoredResumes);
  const atsReports = useHistoryStore((state) => state.atsReports);
  const refresh = useHistoryStore((state) => state.refresh);
  const deleteSourceResume = useHistoryStore((state) => state.deleteSourceResume);
  const deleteJobDescription = useHistoryStore((state) => state.deleteJobDescription);
  const deleteTailoredResume = useHistoryStore((state) => state.deleteTailoredResume);

  const loadFromSourceResume = useResumeEditorStore((state) => state.loadFromSourceResume);
  const loadJobDescription = useJobDescriptionStore((state) => state.loadFromImport);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!hasMounted) return null;

  async function handleDeleteSourceResume(id: string) {
    const result = await deleteSourceResume(id);
    if (result.deleted) {
      toast.success("Resume deleted");
      return;
    }
    const confirmed = window.confirm(
      `This resume has ${result.dependentCount} tailored version(s) saved against it. Delete those too?`,
    );
    if (confirmed) {
      await deleteSourceResume(id, true);
      toast.success("Resume and its tailored versions deleted");
    }
  }

  async function handleDeleteJobDescription(id: string) {
    const result = await deleteJobDescription(id);
    if (result.deleted) {
      toast.success("Job description deleted");
      return;
    }
    const confirmed = window.confirm(
      `This job description has ${result.dependentCount} tailored resume(s) saved against it. Delete those too?`,
    );
    if (confirmed) {
      await deleteJobDescription(id, true);
      toast.success("Job description and its tailored resumes deleted");
    }
  }

  async function handleDeleteTailoredResume(id: string) {
    await deleteTailoredResume(id);
    toast.success("Tailored resume deleted");
  }

  // Server-rendered HTML never has persisted data, and the first client
  // paint is pre-refresh — show a loading state until IndexedDB has been read.
  if (!isLoaded) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading your saved history…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Resumes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sourceResumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No resumes saved yet. Use &ldquo;Save to History&rdquo; on the Resume Editor page.
            </p>
          ) : (
            sourceResumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between gap-3 border-b border-input pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{resume.label}</p>
                  <p className="text-sm text-muted-foreground">Updated {formatDate(resume.updatedAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      loadFromSourceResume(resume);
                      toast.success("Resume loaded into the editor");
                    }}
                  >
                    Load into editor
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDeleteSourceResume(resume.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Job Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {jobDescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No job descriptions saved yet. Use &ldquo;Save to History&rdquo; on the Job Description page.
            </p>
          ) : (
            jobDescriptions.map((jobDescription) => (
              <div
                key={jobDescription.id}
                className="flex items-center justify-between gap-3 border-b border-input pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{jobDescription.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {jobDescription.title || "Untitled role"}
                    {jobDescription.company ? ` — ${jobDescription.company}` : ""} · Saved{" "}
                    {formatDate(jobDescription.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      loadJobDescription(jobDescription);
                      toast.success("Job description loaded");
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDeleteJobDescription(jobDescription.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tailored Resumes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tailoredResumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tailored resumes saved yet. Use &ldquo;Save to History&rdquo; on the Match page.
            </p>
          ) : (
            tailoredResumes.map((tailored) => {
              const source = sourceResumes.find((resume) => resume.id === tailored.sourceResumeId);
              const jobDescription = jobDescriptions.find((jd) => jd.id === tailored.jobDescriptionId);
              const report = atsReports.find((r) => r.id === tailored.atsReportId);
              return (
                <div
                  key={tailored.id}
                  className="flex items-center justify-between gap-3 border-b border-input pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {source?.label ?? "Unknown resume"} → {jobDescription?.title || "Untitled role"}
                      {jobDescription?.company ? ` @ ${jobDescription.company}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {report ? `${report.score}% match` : "—"} · Saved {formatDate(tailored.createdAt)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDeleteTailoredResume(tailored.id)}
                  >
                    Delete
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
