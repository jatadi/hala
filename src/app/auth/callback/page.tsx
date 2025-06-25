'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

async function createUserProfile(userId: string, email: string) {
  const username = email.split('@')[0];
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    // Create new profile
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          username: username,
          email: email,
        }
      ]);

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  return username;
}

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorDescription = searchParams.get('error_description');
    if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          const email = session.user.email;
          if (!email) throw new Error('No email found');
          
          const username = await createUserProfile(session.user.id, email);
          router.push(`/profile/${username}`);
        } catch (err) {
          console.error('Error in auth callback:', err);
          setError('Failed to complete sign in. Please try again.');
        }
      } else {
        router.push('/sign-in');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const email = session.user.email;
          if (!email) throw new Error('No email found');
          
          const username = await createUserProfile(session.user.id, email);
          router.push(`/profile/${username}`);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError('Failed to complete sign in. Please try again.');
        }
      } else if (event === 'SIGNED_OUT') {
        router.push('/sign-in');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md max-w-md">
          <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
} 