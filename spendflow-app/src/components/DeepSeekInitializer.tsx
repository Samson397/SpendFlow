'use client';

import { useEffect } from 'react';
import { initializeDeepSeek } from '@/lib/services/deepSeekService';

export function DeepSeekInitializer() {
  useEffect(() => {
    // Initialize DeepSeek service if API key is available
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    if (apiKey) {
      console.log('🤖 Initializing DeepSeek AI service');
      initializeDeepSeek(apiKey);
    } else {
      console.warn('⚠️ DeepSeek API key not found. AI features will be disabled.');
    }
  }, []);

  return null; // This component doesn't render anything
}
