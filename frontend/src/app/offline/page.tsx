'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaWifi, FaHome } from 'react-icons/fa';

export default function OfflinePage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-md">
        <div className="mb-8 relative w-48 h-48 mx-auto">
          <Image
            src="/images/offline.svg"
            alt="Offline"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">You're Offline</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center justify-center"
          >
            <FaWifi className="mr-2" /> Try Again
          </button>
          <Link href="/" className="btn-outline flex items-center justify-center">
            <FaHome className="mr-2" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
