'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Hook that automatically re-detects currency when user logs in from a different location
 */
export function useLocationBasedCurrency() {
  const { user } = useAuth();
  const { currency, detectCurrencyFromLocation } = useCurrency();
  const lastLocationCheck = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const checkLocationAndUpdateCurrency = async () => {
      try {
        // Check if we have a saved preferred currency (user has manually set one)
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency) {
          // User has a preferred currency, don't auto-change it
          return;
        }

        // Get current location data
        const response = await fetch('https://ipapi.co/json/');
        const locationData = await response.json();
        const currentLocationKey = `${locationData.country_code}-${locationData.city}`;

        // Check if location has changed since last check
        const storedLocationKey = localStorage.getItem(`lastLocationCheck_${user.uid}`);

        if (storedLocationKey !== currentLocationKey) {
          console.log('📍 Location changed, re-detecting currency...', {
            from: storedLocationKey,
            to: currentLocationKey,
            currency: locationData.currency
          });

          // Location has changed, re-detect currency
          await detectCurrencyFromLocation();

          // Store the new location
          localStorage.setItem(`lastLocationCheck_${user.uid}`, currentLocationKey);
        }

        lastLocationCheck.current = currentLocationKey;
      } catch (error) {
        console.log('Could not check location for currency update:', error);
      }
    };

    // Check location when user logs in (with a delay to ensure everything is loaded)
    const timer = setTimeout(() => {
      checkLocationAndUpdateCurrency();
    }, 3000); // 3 second delay to ensure user context is fully loaded

    return () => clearTimeout(timer);
  }, [user?.uid, detectCurrencyFromLocation]);

  return null;
}
