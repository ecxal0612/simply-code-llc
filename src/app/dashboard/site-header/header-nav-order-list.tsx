"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function SortableNavRow({
  id,
  label,
  path,
}: {
  id: string;
  label: string;
  path: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={
        isDragging
          ? "bg-muted flex items-center gap-3 rounded-lg border p-3 shadow-sm"
          : "flex items-center gap-3 rounded-lg border bg-background p-3"
      }
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none p-1 active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-muted-foreground font-mono text-xs">{path}</p>
      </div>
    </div>
  );
}

export function HeaderNavOrderList({
  paths,
  pageByPath,
  onReorder,
}: {
  paths: string[];
  pageByPath: Map<string, { title: string }>;
  onReorder: (paths: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = paths.indexOf(String(active.id));
    const newIndex = paths.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(paths, oldIndex, newIndex));
  }

  if (paths.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
        Select pages below to build the header menu, then drag to set the order.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={paths} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {paths.map((path) => (
            <SortableNavRow
              key={path}
              id={path}
              path={path}
              label={pageByPath.get(path)?.title ?? path}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
