import { Navbar } from '@/components/navbar';
import { getRaceDetails, getRaceWatchers } from '@/lib/supabase/queries/races';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';

interface WatchersPageProps {
  params: {
    id: string;
  };
}

export default async function WatchersPage({ params }: WatchersPageProps) {
  const [race, watchers] = await Promise.all([
    getRaceDetails(parseInt(params.id, 10)),
    getRaceWatchers(parseInt(params.id, 10))
  ]);

  if (!race) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/races/${race.race_id}`}
            className="text-hala-orange hover:text-hala-orange/80"
          >
            ← Back to {race.race_name}
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Who watched {race.race_name} {race.year}
          </h1>
        </div>

        <div className="space-y-6">
          {watchers.map((watcher) => (
            <div
              key={watcher.user_id}
              className="bg-hala-blue-darker rounded-lg p-4 flex items-start gap-4"
            >
              {/* Avatar */}
              <Link href={`/profile/${watcher.username}`} className="flex-shrink-0">
                <div className="h-12 w-12 relative rounded-full overflow-hidden bg-gray-800">
                  {watcher.avatar_url ? (
                    <Image
                      src={watcher.avatar_url}
                      alt={watcher.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white text-lg">
                      {watcher.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-2">
                  <Link
                    href={`/profile/${watcher.username}`}
                    className="text-white hover:text-hala-orange font-medium"
                  >
                    {watcher.username}
                  </Link>
                  {watcher.rating && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={watcher.rating} size="sm" />
                      <span className="text-gray-400 text-sm">
                        ({watcher.rating.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
                {watcher.review && (
                  <p className="text-gray-300 text-sm">{watcher.review}</p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  Watched on {new Date(watcher.watched_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {watchers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No one has watched this race yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 