'use client';

import { useState, ReactNode, useEffect } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
  children,
  className = ''
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isReadyToRefresh, setIsReadyToRefresh] = useState(false);

  // Detect if device is mobile/tablet
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Enable on tablets and phones, disable on desktop
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const containerRef = usePullToRefresh({
    onRefresh: async () => {
      setIsRefreshing(true);
      setPullProgress(0);
      setIsReadyToRefresh(false);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    },
    threshold,
    disabled: disabled || !isMobile, // Only enable on mobile/tablet
    onPullProgress: (progress, isReady) => {
      setPullProgress(progress);
      setIsReadyToRefresh(isReady);
    }
  });

  if (!isMobile) {
    // On desktop, just return children without pull-to-refresh
    return (
      <div className={`w-full h-full overflow-y-auto ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Pull Indicator - Only show on mobile/tablet */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-linear-to-b from-slate-900/95 via-slate-900/80 to-transparent backdrop-blur-md border-b border-slate-700/50 transition-all duration-300"
        style={{
          height: isRefreshing ? '64px' : pullProgress > 0 ? '48px' : '0px',
          opacity: isRefreshing || pullProgress > 0.1 ? 1 : 0,
          transform: isRefreshing ? 'translateY(0)' : pullProgress > 0 ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="flex items-center gap-3 text-slate-200">
          {!isRefreshing && (
            <div className="relative">
              <RefreshCw
                className={`h-5 w-5 transition-transform duration-300 ${
                  isReadyToRefresh ? 'text-green-400 rotate-180' : 'text-slate-400'
                }`}
                style={{
                  transform: isReadyToRefresh ? 'rotate(180deg)' : `rotate(${pullProgress * 180}deg)`
                }}
              />
            </div>
          )}
          {isRefreshing && (
            <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
          )}
          <span className="text-sm font-semibold tracking-wide">
            {isRefreshing ? 'Refreshing...' :
             isReadyToRefresh ? 'Release to refresh' :
             pullProgress > 0 ? 'Pull to refresh' : ''}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {pullProgress > 0 && !isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-5 h-1 bg-slate-700">
          <div
            className={`h-full transition-all duration-100 ${
              isReadyToRefresh ? 'bg-green-400' : 'bg-amber-400'
            }`}
            style={{ width: `${pullProgress * 100}%` }}
          />
        </div>
      )}

      {/* Content Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto"
        style={{
          paddingTop: isRefreshing ? '64px' : pullProgress > 0 ? '48px' : '0px',
          transition: isRefreshing ? 'padding-top 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
