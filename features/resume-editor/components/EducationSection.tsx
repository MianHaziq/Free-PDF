"use client"; // drag-and-drop + controlled inputs writing to the store

import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { SortableEntryCard } from "@/features/resume-editor/components/SortableEntryCard";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useSortableSection } from "@/features/resume-editor/useSortableSection";
import type { EducationEntry } from "@/types/resume";

export function EducationSection() {
  const education = useResumeEditorStore((state) => state.education);
  const addEducation = useResumeEditorStore((state) => state.addEducation);
  const updateEducation = useResumeEditorStore((state) => state.updateEducation);
  const removeEducation = useResumeEditorStore((state) => state.removeEducation);
  const reorderEducation = useResumeEditorStore((state) => state.reorderEducation);

  const ids = education.map((entry) => entry.entryId);
  const { sensors, handleDragEnd } = useSortableSection(ids, reorderEducation);

  function patch(entryId: string, data: EducationEntry, changes: Partial<EducationEntry>) {
    updateEducation(entryId, { ...data, ...changes });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {education.map(({ entryId, data }) => (
              <SortableEntryCard
                key={entryId}
                id={entryId}
                onRemove={() => removeEducation(entryId)}
                removeLabel={`Remove education at ${data.institution || "this institution"}`}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`degree-${entryId}`} label="Degree">
                    <Input
                      id={`degree-${entryId}`}
                      value={data.degree}
                      onChange={(event) => patch(entryId, data, { degree: event.target.value })}
                    />
                  </FormField>
                  <FormField id={`institution-${entryId}`} label="Institution">
                    <Input
                      id={`institution-${entryId}`}
                      value={data.institution}
                      onChange={(event) =>
                        patch(entryId, data, { institution: event.target.value })
                      }
                    />
                  </FormField>
                  <FormField id={`start-${entryId}`} label="Start date (YYYY-MM)">
                    <Input
                      id={`start-${entryId}`}
                      placeholder="2020-09"
                      value={data.startDate ?? ""}
                      onChange={(event) =>
                        patch(entryId, data, { startDate: event.target.value || null })
                      }
                    />
                  </FormField>
                  <FormField id={`end-${entryId}`} label="End date (YYYY-MM)">
                    <Input
                      id={`end-${entryId}`}
                      placeholder="2024-05"
                      value={data.endDate ?? ""}
                      onChange={(event) =>
                        patch(entryId, data, { endDate: event.target.value || null })
                      }
                    />
                  </FormField>
                </div>
              </SortableEntryCard>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" onClick={() => addEducation()}>
          Add education
        </Button>
      </CardContent>
    </Card>
  );
}
