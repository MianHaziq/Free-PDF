"use client"; // drag-and-drop + controlled inputs writing to the store

import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { ListField } from "@/features/resume-editor/components/ListField";
import { SortableEntryCard } from "@/features/resume-editor/components/SortableEntryCard";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useSortableSection } from "@/features/resume-editor/useSortableSection";
import type { ExperienceEntry } from "@/types/resume";

export function ExperienceSection() {
  const experience = useResumeEditorStore((state) => state.experience);
  const addExperience = useResumeEditorStore((state) => state.addExperience);
  const updateExperience = useResumeEditorStore((state) => state.updateExperience);
  const removeExperience = useResumeEditorStore((state) => state.removeExperience);
  const reorderExperience = useResumeEditorStore((state) => state.reorderExperience);

  const ids = experience.map((entry) => entry.id);
  const { sensors, handleDragEnd } = useSortableSection(ids, reorderExperience);

  function patch(entry: ExperienceEntry, changes: Partial<Omit<ExperienceEntry, "id">>) {
    updateExperience(entry.id, {
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      bullets: entry.bullets,
      relevanceTags: entry.relevanceTags,
      ...changes,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {experience.map((entry) => (
              <SortableEntryCard
                key={entry.id}
                id={entry.id}
                onRemove={() => removeExperience(entry.id)}
                removeLabel={`Remove experience at ${entry.company || "this role"}`}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`company-${entry.id}`} label="Company">
                    <Input
                      id={`company-${entry.id}`}
                      value={entry.company}
                      onChange={(event) => patch(entry, { company: event.target.value })}
                    />
                  </FormField>
                  <FormField id={`role-${entry.id}`} label="Role">
                    <Input
                      id={`role-${entry.id}`}
                      value={entry.role}
                      onChange={(event) => patch(entry, { role: event.target.value })}
                    />
                  </FormField>
                  <FormField id={`start-${entry.id}`} label="Start date (YYYY-MM)">
                    <Input
                      id={`start-${entry.id}`}
                      placeholder="2024-01"
                      value={entry.startDate}
                      onChange={(event) => patch(entry, { startDate: event.target.value })}
                    />
                  </FormField>
                  <FormField
                    id={`end-${entry.id}`}
                    label="End date (YYYY-MM, blank = current)"
                  >
                    <Input
                      id={`end-${entry.id}`}
                      placeholder="2024-12"
                      value={entry.endDate ?? ""}
                      onChange={(event) =>
                        patch(entry, { endDate: event.target.value || null })
                      }
                    />
                  </FormField>
                </div>
                <ListField
                  id={`bullets-${entry.id}`}
                  label="Bullets (one per line)"
                  values={entry.bullets}
                  onCommit={(bullets) => patch(entry, { bullets })}
                />
              </SortableEntryCard>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" onClick={() => addExperience()}>
          Add experience
        </Button>
      </CardContent>
    </Card>
  );
}
