'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Navbar } from '@/components/navbar';
import { UserProfile } from '@/lib/types/user';
import Image from 'next/image';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const MAX_BIO_LENGTH = 500;

export default function EditProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    bio?: string;
  }>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    async function checkAuthAndLoadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/sign-in');
          return;
        }

        // Get current user's profile
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (currentUserError || !currentUserData) {
          throw new Error('Failed to load current user profile');
        }

        // Check if the user is trying to edit their own profile
        if (currentUserData.username !== params.username) {
          router.push(`/profile/${params.username}`);
          return;
        }

        // Load the profile to edit
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('username', params.username)
          .single();

        if (profileError) {
          throw new Error('Failed to load profile');
        }

        setProfile(profileData);
        setFormData({
          username: profileData.username,
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadProfile();
  }, [params.username, router]);

  const validateUsername = async (username: string): Promise<string | null> => {
    if (!USERNAME_REGEX.test(username)) {
      return 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens';
    }

    if (username !== profile?.username) {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (data) {
        return 'Username is already taken';
      }
    }

    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, username: value }));
    setFieldErrors(prev => ({ ...prev, username: undefined }));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setFormData(prev => ({ ...prev, bio: value }));
      setFieldErrors(prev => ({ ...prev, bio: undefined }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setError(null);
      setSaving(true);
      setUploadProgress(0);

      // Get session to verify we have the user's ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
      if (!session?.user?.id) throw new Error('No user ID found in session');

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      console.log('Attempting to upload file:', {
        bucket: 'avatars',
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setUploadProgress(100);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      setSaving(true);

      // Validate username
      const usernameError = await validateUsername(formData.username);
      if (usernameError) {
        setFieldErrors(prev => ({ ...prev, username: usernameError }));
        return;
      }

      // Validate bio length
      if (formData.bio.length > MAX_BIO_LENGTH) {
        setFieldErrors(prev => ({ ...prev, bio: `Bio must be ${MAX_BIO_LENGTH} characters or less` }));
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('username', params.username);

      if (updateError) throw updateError;

      // If username was changed, redirect to new profile URL
      if (formData.username !== params.username) {
        router.push(`/profile/${formData.username}`);
      } else {
        router.push(`/profile/${params.username}`);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
            Profile not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
          
          {error && (
            <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 relative rounded-full overflow-hidden bg-gray-700">
                  {formData.avatar_url ? (
                    <Image
                      src={formData.avatar_url}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-2xl">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-sm">{uploadProgress}%</div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-hala-orange hover:bg-hala-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hala-orange transition-colors duration-200 disabled:opacity-50"
                  >
                    {formData.avatar_url ? 'Change Photo' : 'Add Photo'}
                  </button>
                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                      className="ml-2 text-sm text-gray-400 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleUsernameChange}
                className={`mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-hala-orange focus:bg-gray-600 focus:ring-0 text-white ${
                  fieldErrors.username ? 'border-red-500' : ''
                }`}
                disabled={saving}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleBioChange}
                className={`mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-hala-orange focus:bg-gray-600 focus:ring-0 text-white ${
                  fieldErrors.bio ? 'border-red-500' : ''
                }`}
                disabled={saving}
              />
              <div className="mt-1 flex justify-between items-center">
                {fieldErrors.bio && (
                  <p className="text-sm text-red-500">{fieldErrors.bio}</p>
                )}
                <p className="text-sm text-gray-400">
                  {formData.bio.length}/{MAX_BIO_LENGTH}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/profile/${params.username}`)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-hala-orange hover:bg-hala-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hala-orange transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 