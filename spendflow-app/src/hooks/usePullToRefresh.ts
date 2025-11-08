'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number; // Minimum distance to trigger refresh (default: 80px)
  disabled?: boolean;
  className?: string;
  onPullProgress?: (progress: number, isReady: boolean) => void; // Progress callback
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
  onPullProgress
}: PullToRefreshOptions) {
  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const pullDistance = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    isPulling.current = false;
    pullDistance.current = 0;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !containerRef.current) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - touchStartY.current;

    // Only activate if we're at the top of the scrollable area
    if (containerRef.current.scrollTop === 0 && deltaY > 0) {
      isPulling.current = true;
      pullDistance.current = Math.min(deltaY * 0.5, threshold * 2); // Dampen the pull

      // Prevent default scrolling behavior
      e.preventDefault();

      // Add visual feedback
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${pullDistance.current}px)`;
        containerRef.current.style.transition = 'none';
      }

      // Call progress callback
      const progress = Math.min(pullDistance.current / threshold, 1);
      const isReady = pullDistance.current >= threshold;
      onPullProgress?.(progress, isReady);
    }
  }, [disabled, threshold, onPullProgress]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !containerRef.current) return;

    if (isPulling.current && pullDistance.current >= threshold) {
      // Trigger refresh
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh failed:', error);
      }
    }

    // Reset visual feedback
    if (containerRef.current) {
      containerRef.current.style.transform = '';
      containerRef.current.style.transition = 'transform 0.3s ease-out';
    }

    isPulling.current = false;
    pullDistance.current = 0;
  }, [disabled, onRefresh, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  return containerRef;
}
