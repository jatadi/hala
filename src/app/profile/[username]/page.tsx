'use client';

import { Navbar } from '@/components/navbar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { RecentActivity } from '@/components/profile/RecentActivity';
import { FollowList } from '@/components/social/FollowList';
import { useEffect, useState } from 'react';
import { getUserProfile, getCurrentUserProfile } from '@/lib/supabase/queries/profile';
import { notFound } from 'next/navigation';
import type { UserProfile } from '@/lib/types/user';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

type ProfileTab = 'activity' | 'followers' | 'following';

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' }
];

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const [userProfile, currentUserProfile] = await Promise.all([
          getUserProfile(params.username),
          getCurrentUserProfile()
        ]);
        
        if (!userProfile) {
          notFound();
        }

        setProfile(userProfile);
        setCurrentUser(currentUserProfile);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [params.username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Profile Header Skeleton */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/5 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-white/5 rounded w-1/3" />
                <div className="h-4 bg-white/5 rounded w-1/4" />
              </div>
            </div>
            {/* Recent Activity Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-white/5 rounded w-1/4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] bg-white/5 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500">
            {error || 'Failed to load profile'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ProfileHeader 
            profile={profile} 
            isCurrentUser={currentUser?.id === profile.id}
            onTabChange={setActiveTab}
          />
          
          {/* Tab Navigation */}
          <div className="border-b border-white/10">
            <nav className="-mb-px flex space-x-8" aria-label="Profile sections">
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
          
          {/* Tab Content */}
          {activeTab === 'activity' && (
            <RecentActivity userId={profile.id} />
          )}
          {activeTab === 'followers' && (
            <FollowList 
              userId={profile.id}
              type="followers"
              currentUserId={currentUser?.id}
            />
          )}
          {activeTab === 'following' && (
            <FollowList 
              userId={profile.id}
              type="following"
              currentUserId={currentUser?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
} 