import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function ListNotFound() {
  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            List Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The list you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/lists"
            className="inline-flex items-center px-4 py-2 bg-hala-orange text-white rounded-md hover:bg-hala-orange/80 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Lists
          </Link>
        </div>
      </main>
    </div>
  );
} 