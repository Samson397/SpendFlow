'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main landing page
    router.replace('/landing');
  }, [router]);

  return null;
}
