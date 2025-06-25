'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface RaceNavigationProps {
  previousRace: { id: number; name: string } | null;
  nextRace: { id: number; name: string } | null;
}

export function RaceNavigation({ previousRace, nextRace }: RaceNavigationProps) {
  return (
    <div className="fixed top-24 left-0 right-0 flex justify-between px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="pointer-events-auto">
        {nextRace && (
          <Link
            href={`/races/${nextRace.id}`}
            className="group flex items-center text-gray-400 hover:text-white transition-colors"
            title={`Previous Race: ${nextRace.name}`}
          >
            <ChevronLeftIcon className="h-8 w-8" />
            <span className="sr-only">Previous Race: {nextRace.name}</span>
          </Link>
        )}
      </div>
      <div className="pointer-events-auto">
        {previousRace && (
          <Link
            href={`/races/${previousRace.id}`}
            className="group flex items-center text-gray-400 hover:text-white transition-colors"
            title={`Next Race: ${previousRace.name}`}
          >
            <ChevronRightIcon className="h-8 w-8" />
            <span className="sr-only">Next Race: {previousRace.name}</span>
          </Link>
        )}
      </div>
    </div>
  );
} 