'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getListDetails, updateList } from '@/lib/supabase/queries/lists';
import { ListForm } from '@/components/lists/ListForm';
import type { ListDetails } from '@/lib/types/list';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

export default function EditListPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [list, setList] = useState<ListDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const listDetails = await getListDetails(params.id);
        if (!listDetails?.length) {
          router.replace('/not-found');
          return;
        }
        setList(listDetails[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [params.id, router]);

  const handleSubmit = async (formData: { title: string; description: string | null; is_public: boolean }) => {
    try {
      await updateList(params.id, formData);
      router.push(`/lists/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
    }
  };

  if (isLoading) {
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

  if (error || !list) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500">
            {error || 'Failed to load list'}
          </div>
        </div>
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
            href={`/lists/${list.id}`}
            className="text-hala-orange hover:text-hala-orange/80"
          >
            ← Back to {list.title}
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Edit List</h1>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <ListForm
            initialValues={{
              title: list.title,
              description: list.description || '',
              is_public: list.is_public
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </div>
      </main>
    </div>
  );
} 