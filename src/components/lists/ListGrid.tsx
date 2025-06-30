'use client';

import { ListCard } from './ListCard';
import type { ListDetails } from '@/lib/types/list';

interface ListGridProps {
  lists: ListDetails[];
  isLoading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
}

export function ListGrid({ 
  lists, 
  isLoading = false, 
  emptyMessage = "No lists found.", 
  showActions = true 
}: ListGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-pulse"
          >
            {/* Header skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full" />
                <div className="h-4 w-24 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-2/3 bg-white/10 rounded" />
            </div>

            {/* Footer skeleton */}
            <div className="mt-4 flex items-center gap-4">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!lists.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-12 h-12 text-gray-500 mb-4"
        >
          <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lists.map(list => (
        <ListCard 
          key={list.id} 
          list={list} 
          showActions={showActions}
        />
      ))}
    </div>
  );
} 