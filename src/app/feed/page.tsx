'use client';

import { Navbar } from '@/components/navbar';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '@/lib/supabase/queries/profile';
import { redirect, useRouter } from 'next/navigation';
import type { ActivitySource } from '@/lib/supabase/queries/activity';
import Link from 'next/link';

type FeedTab = Extract<ActivitySource, 'following' | 'you'>;

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'following', label: 'Following' },
  { id: 'you', label: 'You' }
];

export default function FeedPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeedTab>('following');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await getCurrentUserProfile();
        setUserId(profile?.id ?? null);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/5 rounded w-1/4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-white/10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/4" />
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 space-y-4">
              <p className="text-gray-300">
                Sign in to see activities from people you follow and share your own race logs.
              </p>
              <Link
                href="/sign-in"
                className="inline-block bg-hala-orange hover:bg-hala-orange-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Sign in to Hala
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 space-y-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-hala-orange hover:bg-hala-orange-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Activity Feed</h1>
            
            {/* Tab Navigation */}
            <div className="border-b border-white/10">
              <nav className="-mb-px flex space-x-8" aria-label="Feed sections">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-hala-orange text-hala-orange'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Feed Content */}
          <ActivityFeed 
            userId={userId} 
            source={activeTab}
            key={activeTab} // Reset feed when switching tabs
          />
        </div>
      </div>
    </div>
  );
} 