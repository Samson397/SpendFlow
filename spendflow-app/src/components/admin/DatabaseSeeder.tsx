'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function DatabaseSeeder() {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setResult('');

    try {
      const response = await fetch('/api/admin/seed-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Database seeded successfully! Refresh the page to see the plans.');
        // Auto-refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Only show for admin users or if no user (to allow setup)
  if (!user && !result.includes('success')) return null;

  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={handleSeedDatabase}
        disabled={isSeeding}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
      >
        {isSeeding ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Setting up...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Seed Database
          </>
        )}
      </button>

      {result && (
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
          result.includes('✅') 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
