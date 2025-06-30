'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ListForm } from '@/components/lists/ListForm';
import { Toast } from '@/components/ui/Toast';
import { useUserId } from '@/lib/auth/useUserId';
import { createList } from '@/lib/supabase/queries/lists';
import type { CreateListRequest } from '@/lib/types/list';
import Link from 'next/link';

export default function NewListPage() {
  const router = useRouter();
  const userId = useUserId();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateListRequest) => {
    try {
      const listId = await createList(data);
      router.push(`/lists/${listId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Sign in to create lists
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/lists"
            className="text-hala-orange hover:text-hala-orange/80"
          >
            ← Back to Lists
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Create New List
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <ListForm 
            onSubmit={handleSubmit}
            submitLabel="Create List"
          />
        </div>

        {/* Error Toast */}
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        )}
      </main>
    </div>
  );
} 