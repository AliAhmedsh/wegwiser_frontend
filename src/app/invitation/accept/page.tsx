'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AcceptInvitationPage() {
  const router = useRouter();

  useEffect(() => {
    const queryString = window.location.search;
    
    if (queryString) {
      // Redirect to home page with query params
      router.push(`/${queryString}`);
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
