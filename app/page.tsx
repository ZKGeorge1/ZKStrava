'use client';

import { Suspense } from 'react';
import ProofOfStravaContent from './ProofOfStravaContent';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ProofOfStravaContent />
    </Suspense>
  );
}
