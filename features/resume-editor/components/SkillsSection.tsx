"use client"; // drag-and-drop + controlled inputs writing to the store

import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortableEntryCard } from "@/features/resume-editor/components/SortableEntryCard";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useSortableSection } from "@/features/resume-editor/useSortableSection";

export function SkillsSection() {
  const skills = useResumeEditorStore((state) => state.skills);
  const addSkill = useResumeEditorStore((state) => state.addSkill);
  const updateSkill = useResumeEditorStore((state) => state.updateSkill);
  const removeSkill = useResumeEditorStore((state) => state.removeSkill);
  const reorderSkills = useResumeEditorStore((state) => state.reorderSkills);

  const ids = skills.map((entry) => entry.entryId);
  const { sensors, handleDragEnd } = useSortableSection(ids, reorderSkills);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {skills.map((entry) => (
              <SortableEntryCard
                key={entry.entryId}
                id={entry.entryId}
                onRemove={() => removeSkill(entry.entryId)}
                removeLabel={`Remove skill ${entry.data.name || ""}`.trim()}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    aria-label="Skill name"
                    placeholder="Skill name"
                    value={entry.data.name}
                    onChange={(event) =>
                      updateSkill(entry.entryId, { ...entry.data, name: event.target.value })
                    }
                  />
                  <Input
                    aria-label="Skill category"
                    placeholder="Category (optional)"
                    value={entry.data.category ?? ""}
                    onChange={(event) =>
                      updateSkill(entry.entryId, {
                        ...entry.data,
                        category: event.target.value || null,
                      })
                    }
                  />
                </div>
              </SortableEntryCard>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" onClick={() => addSkill()}>
          Add skill
        </Button>
      </CardContent>
    </Card>
  );
}
