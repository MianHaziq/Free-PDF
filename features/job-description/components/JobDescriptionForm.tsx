"use client"; // controlled inputs writing straight through to the store

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { ListField } from "@/components/ui/ListField";
import { useJobDescriptionStore } from "@/features/job-description/store";

export function JobDescriptionForm() {
  const id = useJobDescriptionStore((state) => state.id);
  const title = useJobDescriptionStore((state) => state.title);
  const company = useJobDescriptionStore((state) => state.company);
  const experienceLevel = useJobDescriptionStore((state) => state.experienceLevel);
  const requiredSkills = useJobDescriptionStore((state) => state.requiredSkills);
  const preferredSkills = useJobDescriptionStore((state) => state.preferredSkills);
  const keywords = useJobDescriptionStore((state) => state.keywords);

  const setTitle = useJobDescriptionStore((state) => state.setTitle);
  const setCompany = useJobDescriptionStore((state) => state.setCompany);
  const setExperienceLevel = useJobDescriptionStore((state) => state.setExperienceLevel);
  const setRequiredSkills = useJobDescriptionStore((state) => state.setRequiredSkills);
  const setPreferredSkills = useJobDescriptionStore((state) => state.setPreferredSkills);
  const setKeywords = useJobDescriptionStore((state) => state.setKeywords);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="title" label="Title">
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <FormField id="company" label="Company">
            <Input
              id="company"
              value={company ?? ""}
              onChange={(event) => setCompany(event.target.value || null)}
            />
          </FormField>
          <FormField id="experienceLevel" label="Experience level">
            <Input
              id="experienceLevel"
              placeholder="e.g. Mid, Senior"
              value={experienceLevel ?? ""}
              onChange={(event) => setExperienceLevel(event.target.value || null)}
            />
          </FormField>
        </div>
        <ListField
          key={`required-${id}`}
          id="requiredSkills"
          label="Required skills (comma-separated)"
          values={requiredSkills}
          delimiter=","
          rows={2}
          onCommit={setRequiredSkills}
        />
        <ListField
          key={`preferred-${id}`}
          id="preferredSkills"
          label="Preferred skills (comma-separated)"
          values={preferredSkills}
          delimiter=","
          rows={2}
          onCommit={setPreferredSkills}
        />
        <ListField
          key={`keywords-${id}`}
          id="keywords"
          label="Keywords (comma-separated)"
          values={keywords}
          delimiter=","
          rows={2}
          onCommit={setKeywords}
        />
      </CardContent>
    </Card>
  );
}
