'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { RaceListItem } from './RaceListItem';
import type { ListItem } from '@/lib/types/list';
import { reorderListItems, updateListItemNote, removeListItem } from '@/lib/supabase/queries/lists';
import { useRouter } from 'next/navigation';

interface ListItemsProps {
  items: ListItem[];
  isEditing: boolean;
  onItemsChange: (items: ListItem[]) => void;
}

export function ListItems({ items, isEditing, onItemsChange }: ListItemsProps) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex(item => item.id === active.id);
      const newIndex = localItems.findIndex(item => item.id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        display_order: index
      }));

      setLocalItems(newItems);
      onItemsChange(newItems);

      try {
        setIsReordering(true);
        await reorderListItems(newItems);
      } catch (error) {
        console.error('Failed to reorder items:', error);
        // Revert to original order on error
        setLocalItems(items);
        onItemsChange(items);
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleNoteChange = async (itemId: string, note: string) => {
    const newItems = localItems.map(item =>
      item.id === itemId ? { ...item, note } : item
    );
    setLocalItems(newItems);
    onItemsChange(newItems);

    try {
      await updateListItemNote(itemId, note);
    } catch (error) {
      console.error('Failed to update note:', error);
      // Revert to original note on error
      setLocalItems(items);
      onItemsChange(items);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeListItem(itemId);
      // Optimistically update UI
      const newItems = localItems.filter(item => item.id !== itemId);
      setLocalItems(newItems);
      onItemsChange(newItems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No races in this list yet.</p>
        {isEditing && (
          <button
            onClick={() => router.push('/races')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-hala-orange hover:bg-hala-orange/80 rounded-md transition"
          >
            Browse Races
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {localItems.map((item) => (
            <div 
              key={item.id}
              className="relative group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition"
            >
              <RaceListItem
                item={item}
                isEditing={isEditing}
                onNoteChange={note => handleNoteChange(item.id, note)}
              />
              
              {isEditing && (
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Remove from list"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {isReordering && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Saving order...</span>
          </div>
        </div>
      )}

      {isEditing && (
        <Link
          href="/races"
          className="block w-full py-3 border-2 border-dashed border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>Add Race</span>
          </div>
        </Link>
      )}
    </div>
  );
} 