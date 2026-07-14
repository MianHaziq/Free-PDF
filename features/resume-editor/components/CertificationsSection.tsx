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
import type { CertificationEntry } from "@/types/resume";

export function CertificationsSection() {
  const certifications = useResumeEditorStore((state) => state.certifications);
  const addCertification = useResumeEditorStore((state) => state.addCertification);
  const updateCertification = useResumeEditorStore((state) => state.updateCertification);
  const removeCertification = useResumeEditorStore((state) => state.removeCertification);
  const reorderCertifications = useResumeEditorStore((state) => state.reorderCertifications);

  const ids = certifications.map((entry) => entry.entryId);
  const { sensors, handleDragEnd } = useSortableSection(ids, reorderCertifications);

  function patch(
    entryId: string,
    data: CertificationEntry,
    changes: Partial<CertificationEntry>,
  ) {
    updateCertification(entryId, { ...data, ...changes });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {certifications.map(({ entryId, data }) => (
              <SortableEntryCard
                key={entryId}
                id={entryId}
                onRemove={() => removeCertification(entryId)}
                removeLabel={`Remove certification ${data.name || ""}`.trim()}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`name-${entryId}`} label="Name">
                    <Input
                      id={`name-${entryId}`}
                      value={data.name}
                      onChange={(event) => patch(entryId, data, { name: event.target.value })}
                    />
                  </FormField>
                  <FormField id={`issuer-${entryId}`} label="Issuer">
                    <Input
                      id={`issuer-${entryId}`}
                      value={data.issuer ?? ""}
                      onChange={(event) =>
                        patch(entryId, data, { issuer: event.target.value || null })
                      }
                    />
                  </FormField>
                  <FormField id={`date-${entryId}`} label="Date (YYYY-MM)">
                    <Input
                      id={`date-${entryId}`}
                      placeholder="2024-06"
                      value={data.date ?? ""}
                      onChange={(event) =>
                        patch(entryId, data, { date: event.target.value || null })
                      }
                    />
                  </FormField>
                </div>
              </SortableEntryCard>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" onClick={() => addCertification()}>
          Add certification
        </Button>
      </CardContent>
    </Card>
  );
}
