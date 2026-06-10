'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard, KanbanCardProps } from './KanbanCard';

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', color: '#94A3B8' },
  { id: 'in-progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'review', title: 'Review', color: '#4F46E5' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

export interface KanbanBoardProps {
  columns?: KanbanColumn[];
  initialCards?: KanbanCardProps[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
}

export function KanbanBoard({
  columns = DEFAULT_COLUMNS,
  initialCards = [],
  onCardMove,
}: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCardProps[]>(initialCards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    const targetColumn = columns.find((col) => col.id === over.id);
    if (targetColumn) {
      const fromColumn = draggedCard.status;
      setCards((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, status: targetColumn.id } : c)),
      );
      onCardMove?.(active.id as string, fromColumn, targetColumn.id);
      return;
    }

    const overCard = cards.find((c) => c.id === over.id);
    if (!overCard) return;

    if (draggedCard.status === overCard.status) {
      setCards((prev) => {
        const fromIdx = prev.findIndex((c) => c.id === active.id);
        const toIdx = prev.findIndex((c) => c.id === over.id);
        return arrayMove(prev, fromIdx, toIdx);
      });
    } else {
      const fromColumn = draggedCard.status;
      setCards((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, status: overCard.status } : c)),
      );
      onCardMove?.(active.id as string, fromColumn, overCard.status);
    }
  }

  const cardsInColumn = (colId: string) => cards.filter((c) => c.status === colId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="overflow-x-auto pb-4"
        role="region"
        aria-label="Candidate pipeline kanban board"
      >
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }}
        >
          {columns.map((col) => {
            const columnCards = cardsInColumn(col.id);
            return (
              <div
                key={col.id}
                className="bg-neutral-50 rounded-xl border border-neutral-200"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: col.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-neutral-700">{col.title}</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium" aria-label={`${columnCards.length} cards`}>
                    {columnCards.length}
                  </span>
                </div>
                <SortableContext
                  items={columnCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                  id={col.id}
                >
                  <div className="p-3 space-y-2 min-h-[120px]" role="list" aria-label={`${col.title} column`}>
                    {columnCards.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-4">No candidates</p>
                    ) : (
                      columnCards.map((card) => (
                        <SortableKanbanCard key={card.id} card={card} color={col.color} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCard && (
          <KanbanCard
            {...activeCard}
            color={columns.find((c) => c.id === activeCard.status)?.color ?? '#94A3B8'}
            dragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function SortableKanbanCard({ card, color }: { card: KanbanCardProps; color: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} role="listitem">
      <KanbanCard {...card} color={color} />
    </div>
  );
}
