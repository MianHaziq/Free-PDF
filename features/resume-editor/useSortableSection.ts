"use client"; // wraps @dnd-kit hooks, which require browser pointer/keyboard APIs

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Shared @dnd-kit wiring for every drag-reorderable section (skills,
 * experience, projects, education, certifications) — avoids repeating the
 * sensor/collision setup 5 times (see AI_RULES.md "avoid duplicate logic").
 */
export function useSortableSection(
  ids: string[],
  onReorder: (fromIndex: number, toIndex: number) => void,
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;

    onReorder(fromIndex, toIndex);
  }

  return { sensors, handleDragEnd };
}
