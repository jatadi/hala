import { Navbar } from '@/components/navbar';
import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Profile not found</h2>
          <p className="mt-2 text-gray-400">The profile you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              href="/races"
              className="text-hala-orange hover:text-hala-orange/80 font-semibold"
            >
              Browse races instead →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 