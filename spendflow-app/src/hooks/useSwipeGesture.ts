'use client';

import { useState, useRef, useCallback } from 'react';

interface SwipeActions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    label: string;
    color: string;
    icon: string;
  };
  rightAction?: {
    label: string;
    color: string;
    icon: string;
  };
}

export function useSwipeGesture({ onSwipeLeft, onSwipeRight, leftAction, rightAction }: SwipeActions) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Limit swipe distance
    const maxSwipe = 80;
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    setSwipeOffset(limitedDiff);
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const diff = currentX.current - startX.current;
    const threshold = 50; // Minimum swipe distance to trigger action

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) {
        // Swipe right
        onSwipeRight();
      } else if (diff < 0 && onSwipeLeft) {
        // Swipe left
        onSwipeLeft();
      }
    }

    // Reset swipe state
    setSwipeOffset(0);
    setIsSwiping(false);
  }, [isSwiping, onSwipeLeft, onSwipeRight]);

  return {
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
