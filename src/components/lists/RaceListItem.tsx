'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ListItem } from '@/lib/types/list';
import Link from 'next/link';
import Image from 'next/image';
import type { Race } from '@/lib/types/race';

interface RaceListItemProps {
  item: ListItem;
  isEditing?: boolean;
  onNoteChange?: (note: string) => void;
}

export function RaceListItem({ item, isEditing = false, onNoteChange }: RaceListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const race = item.race;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="block hover:bg-white/5 rounded-lg transition"
    >
      <div className="flex items-center gap-4">
        {race.poster_url ? (
          <Image
            src={race.poster_url}
            alt={race.name}
            width={80}
            height={120}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="w-20 h-[120px] bg-white/5 rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-gray-400">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-white">{race.name}</h3>
          <div className="mt-1 text-sm text-gray-400">
            <p>{race.circuit_name}</p>
            <p>{new Date(race.date).toLocaleDateString()}</p>
          </div>
          <div className="mt-2">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${race.status === 'upcoming' ? 'bg-blue-400/10 text-blue-400' :
                race.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                'bg-red-400/10 text-red-400'}
            `}>
              {race.status.charAt(0).toUpperCase() + race.status.slice(1)}
            </span>
          </div>
          {isEditing && item.note && (
            <p className="mt-2 text-sm text-gray-400">{item.note}</p>
          )}
        </div>
      </div>
    </div>
  );
} 