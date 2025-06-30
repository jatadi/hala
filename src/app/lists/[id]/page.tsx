'use client';

import { useState, useEffect } from 'react';
import { useUserId } from '@/lib/auth/useUserId';
import { getListDetails, getListItems } from '@/lib/supabase/queries/lists';
import type { ListDetails, ListItem } from '@/lib/types/list';
import { ListHeader } from '@/components/lists/ListHeader';
import { ListItems } from '@/components/lists/ListItems';
import { ListComments } from '@/components/lists/ListComments';
import { Navbar } from '@/components/navbar';

export default function ListPage({ params }: { params: { id: string } }) {
  const userId = useUserId();
  const [list, setList] = useState<ListDetails | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchList() {
      try {
        const details = await getListDetails(params.id);
        if (!details?.length) {
          setError('List not found');
          return;
        }
        setList(details[0]);
      } catch (err) {
        console.error('Error fetching list:', err);
        setError(err instanceof Error ? err.message : 'Failed to load list');
      }
    }

    async function fetchItems() {
      try {
        const listItems = await getListItems(params.id);
        setItems(listItems);
      } catch (err) {
        console.error('Error fetching list items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load list items');
      }
    }

    fetchList();
    fetchItems();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isOwner = userId === list.owner_id;

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="space-y-6">
          <ListHeader list={list} isOwner={isOwner} />
          
          {isOwner && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition"
              >
                {isEditing ? 'Done Editing' : 'Edit List'}
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mt-8">
          <ListItems
            items={items}
            isEditing={isEditing}
            onItemsChange={setItems}
          />
        </div>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Comments</h2>
          <ListComments
            listId={params.id}
            isSignedIn={!!userId}
          />
        </div>
      </main>
    </div>
  );
} 