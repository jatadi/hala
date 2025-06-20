import { Navbar } from '@/components/navbar';
import Link from 'next/link';

export default function RaceNotFound() {
  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Race Not Found</h1>
          <p className="text-gray-400 mb-8">
            Looks like this race never made it to the grid.
          </p>
          <Link
            href="/races"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-hala-orange hover:bg-hala-orange/80"
          >
            View All Races
          </Link>
        </div>
      </main>
    </div>
  );
} 