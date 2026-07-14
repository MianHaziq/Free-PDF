"use client"; // per-entry drag state via @dnd-kit's useSortable

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SortableEntryCardProps {
  id: string;
  onRemove: () => void;
  removeLabel: string;
  children: ReactNode;
}

/** Drag handle + delete button + entry-specific fields, shared by every array-based section. */
export function SortableEntryCard({ id, onRemove, removeLabel, children }: SortableEntryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <div className="grid flex-1 gap-3">{children}</div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <Trash2 size={16} aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}
