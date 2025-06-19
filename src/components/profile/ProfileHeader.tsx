import { UserProfile } from '@/lib/types/user';
import Image from 'next/image';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  console.log('Profile data:', profile);

  return (
    <div className="relative">
      {/* Profile Background */}
      <div className="h-48 bg-gradient-to-r from-hala-blue to-hala-dark" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            {/* Avatar */}
            <div className="h-24 w-24 sm:h-32 sm:w-32 relative rounded-full ring-4 ring-white overflow-hidden bg-gray-800">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-700 text-white text-2xl">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white truncate">{profile.username}</h1>
              {profile.bio && (
                <p className="text-gray-400 mt-1">{profile.bio}</p>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-6 flex flex-row justify-stretch space-x-4 sm:space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.races_watched}</p>
                <p className="text-sm text-gray-400">Races</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.following_count}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.followers_count}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              {profile.average_rating !== null && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.average_rating}</p>
                  <p className="text-sm text-gray-400">Avg Rating</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Profile Info */}
        <div className="sm:hidden mt-6">
          <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
          {profile.bio && (
            <p className="text-gray-400 mt-1">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
} 