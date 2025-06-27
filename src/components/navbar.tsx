'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/types/user';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      setUserProfile(profile);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
      setUserProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadUserAndProfile() {
      try {
        setLoading(true);
        setError(null);

        // Check initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (mounted) {
          setError('Failed to load user data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUserAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    } finally {
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  // Loading state UI
  const renderAuthSection = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div>
          <div className="h-8 w-20 bg-gray-700 animate-pulse rounded-lg"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-red-400">Error loading profile</span>
          <button
            onClick={() => window.location.reload()}
            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      );
    }

    if (user && userProfile) {
      return (
        <div className="flex items-center space-x-4">
          <Link
            href={`/profile/${userProfile.username}`}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            {userProfile.username}
          </Link>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            disabled={isSigningOut}
            className="bg-hala-orange hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {isSigningOut ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Signing out...
              </div>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      );
    }

    return (
      <Link 
        href="/sign-in"
        className="bg-hala-orange hover:bg-hala-orange-dark text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Sign in
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-hala-blue-darker border-b border-hala-blue-darker shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold hover:text-hala-orange transition-colors duration-200 text-white">Hala</h1>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/races" 
                className="text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
              >
                Races
              </Link>
              <span className="text-gray-500">|</span>
              <Link 
                href="/feed" 
                className="text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
              >
                Feed
              </Link>
              <span className="text-gray-500">|</span>
              <Link 
                href="/lists" 
                className="text-lg text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
              >
                Lists
              </Link>
              <span className="text-gray-500">|</span>
              <Link 
                href={user ? "/diary" : "/sign-in"} 
                className="text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium"
              >
                Diary
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {renderAuthSection()}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/races"
                  className="block text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium py-2"
                >
                  Races
                </Link>
                <Link
                  href="/feed"
                  className="block text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium py-2"
                >
                  Feed
                </Link>
                <Link
                  href="/lists"
                  className="block text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium py-2"
                >
                  Lists
                </Link>
                <Link
                  href={user ? "/diary" : "/sign-in"}
                  className="block text-gray-300 hover:text-white hover:text-hala-orange transition-colors duration-200 font-medium py-2"
                >
                  Diary
                </Link>
                <div className="py-2">
                  {renderAuthSection()}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900">Sign out?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to sign out?
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 