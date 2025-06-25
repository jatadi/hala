'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Navbar } from '@/components/navbar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { RecentActivity } from '@/components/profile/RecentActivity';
import type { UserProfile } from '@/lib/types/user';

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileAndUser() {
      try {
        // Get current user's ID
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single();
          setCurrentUser(userData?.username || null);
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('username', params.username)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('Profile not found');
          } else {
            setError('Error loading profile');
          }
          setProfile(null);
        } else {
          setProfile(profileData);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndUser();
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hala-orange"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
            {error}
          </div>
          {currentUser && (
            <div className="mt-4">
              <button
                onClick={() => router.push(`/profile/${currentUser}`)}
                className="text-hala-orange hover:text-hala-orange-dark transition-colors duration-200"
              >
                Go to your profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <ProfileHeader 
        profile={profile!} 
        isCurrentUser={currentUser === profile?.username}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecentActivity username={params.username} />
      </main>
    </div>
  );
} 