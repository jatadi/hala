'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { ListGrid } from '@/components/lists/ListGrid';
import { useUserId } from '@/lib/auth/useUserId';
import { getUserLists, getPopularLists } from '@/lib/supabase/queries/lists';
import { getFollowedUsersLists } from '@/lib/supabase/queries/social';
import type { ListDetails } from '@/lib/types/list';
import Link from 'next/link';

type ListSection = 'my' | 'popular' | 'following';

export default function ListsPage() {
  const userId = useUserId();
  const [activeSection, setActiveSection] = useState<ListSection>('my');
  const [lists, setLists] = useState<ListDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists based on active section
  const fetchLists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let fetchedLists: ListDetails[] = [];
      switch (activeSection) {
        case 'my':
          fetchedLists = await getUserLists();
          break;
        case 'popular':
          fetchedLists = await getPopularLists();
          break;
        case 'following':
          fetchedLists = await getFollowedUsersLists();
          break;
      }

      setLists(fetchedLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch lists when section changes
  useEffect(() => {
    if (userId) {
      fetchLists();
    }
  }, [activeSection, userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Sign in to view lists
            </h1>
            <Link
              href="/sign-in"
              className="inline-block bg-hala-orange text-white px-6 py-2 rounded-lg hover:bg-hala-orange/80 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">F1 Race Lists</h1>
          <Link
            href="/lists/new"
            className="flex items-center gap-2 px-4 py-2 bg-hala-orange text-white rounded-lg hover:bg-hala-orange/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create List
          </Link>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveSection('my')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'my'
                ? 'bg-hala-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Lists
          </button>
          <button
            onClick={() => setActiveSection('popular')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'popular'
                ? 'bg-hala-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Popular Lists
          </button>
          <button
            onClick={() => setActiveSection('following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'following'
                ? 'bg-hala-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Following
          </button>
        </div>

        {/* Lists Grid */}
        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <ListGrid
            lists={lists}
            isLoading={isLoading}
            emptyMessage={
              activeSection === 'my'
                ? "You haven't created any lists yet"
                : activeSection === 'following'
                ? "No lists from users you're following"
                : "No popular lists found"
            }
          />
        )}
      </main>
    </div>
  );
} 