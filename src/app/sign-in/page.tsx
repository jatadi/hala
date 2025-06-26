'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Get username from email
        const username = session.user.email?.split('@')[0];
        router.push(`/profile/${username}`);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const username = session.user.email?.split('@')[0];
        router.push(`/profile/${username}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hala-blue">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hala-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-hala-blue to-hala-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-12">
        {/* Logo and Title */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6">
            <Image
              src="/globe.svg"
              alt="Hala Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-center text-4xl font-bold text-white">
            Welcome to Hala
          </h2>
          
          <div className="mt-4 flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-300">
              Track every race, share your thoughts, and connect with fellow fans
            </p>
            
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-hala-dark/50 backdrop-blur-sm rounded-xl p-6 shadow-xl ring-1 ring-white/10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f97316', // hala-orange
                    brandAccent: '#ea580c', // hala-orange-dark
                    brandButtonText: 'white',
                    defaultButtonBackground: '#0f172a', // slate-900
                    defaultButtonBackgroundHover: '#1e293b', // slate-800
                    inputBackground: 'rgba(15, 23, 42, 0.5)', // slate-900/50
                    inputBorder: 'rgba(255, 255, 255, 0.1)',
                    inputBorderHover: 'rgba(255, 255, 255, 0.2)',
                    inputBorderFocus: '#f97316',
                    messageText: 'white',
                    anchorTextColor: 'white',
                    anchorTextHoverColor: '#f97316',
                    inputText: 'white',
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'text-white',
                label: 'text-white',
                button: 'hover:brightness-110 transition-all duration-200 font-medium',
                input: '!text-white bg-hala-dark/50 placeholder:text-gray-400',
                loader: 'border-t-hala-orange border-l-hala-orange',
                anchor: 'text-white hover:text-hala-orange',
                message: 'text-white',
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-hala-orange hover:text-hala-orange-dark">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-hala-orange hover:text-hala-orange-dark">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}