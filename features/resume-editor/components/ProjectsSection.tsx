"use client"; // drag-and-drop + controlled inputs writing to the store

import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import { ListField } from "@/components/ui/ListField";
import { SortableEntryCard } from "@/features/resume-editor/components/SortableEntryCard";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useSortableSection } from "@/features/resume-editor/useSortableSection";
import type { ProjectEntry } from "@/types/resume";

export function ProjectsSection() {
  const projects = useResumeEditorStore((state) => state.projects);
  const addProject = useResumeEditorStore((state) => state.addProject);
  const updateProject = useResumeEditorStore((state) => state.updateProject);
  const removeProject = useResumeEditorStore((state) => state.removeProject);
  const reorderProjects = useResumeEditorStore((state) => state.reorderProjects);

  const ids = projects.map((entry) => entry.id);
  const { sensors, handleDragEnd } = useSortableSection(ids, reorderProjects);

  function patch(entry: ProjectEntry, changes: Partial<Omit<ProjectEntry, "id">>) {
    updateProject(entry.id, {
      name: entry.name,
      description: entry.description,
      technologies: entry.technologies,
      bullets: entry.bullets,
      relevanceTags: entry.relevanceTags,
      ...changes,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {projects.map((entry) => (
              <SortableEntryCard
                key={entry.id}
                id={entry.id}
                onRemove={() => removeProject(entry.id)}
                removeLabel={`Remove project ${entry.name || ""}`.trim()}
              >
                <FormField id={`name-${entry.id}`} label="Project name">
                  <Input
                    id={`name-${entry.id}`}
                    value={entry.name}
                    onChange={(event) => patch(entry, { name: event.target.value })}
                  />
                </FormField>
                <FormField id={`description-${entry.id}`} label="Description">
                  <Input
                    id={`description-${entry.id}`}
                    value={entry.description}
                    onChange={(event) => patch(entry, { description: event.target.value })}
                  />
                </FormField>
                <ListField
                  id={`technologies-${entry.id}`}
                  label="Technologies (comma-separated)"
                  values={entry.technologies}
                  delimiter=","
                  rows={2}
                  onCommit={(technologies) => patch(entry, { technologies })}
                />
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
        <Button type="button" variant="outline" onClick={() => addProject()}>
          Add project
        </Button>
      </CardContent>
    </Card>
  );
}
