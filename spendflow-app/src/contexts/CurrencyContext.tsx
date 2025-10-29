'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
};

const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
};

// Map countries to currencies
const countryCurrencyMap: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  UK: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  JP: 'JPY',
  CA: 'CAD',
  AU: 'AUD',
  CH: 'CHF',
  CN: 'CNY',
  IN: 'INR',
  NG: 'NGN',
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  availableCurrencies: Currency[];
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies.USD);

  const detectCurrency = async () => {
    try {
      // Try to detect from browser locale first
      const browserLocale = navigator.language;
      const countryCode = browserLocale.split('-')[1]?.toUpperCase();
      
      if (countryCode && countryCurrencyMap[countryCode]) {
        const detectedCurrency = countryCurrencyMap[countryCode];
        setCurrencyState(currencies[detectedCurrency]);
        return;
      }

      // Fallback: Try IP-based geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const detectedCountry = data.country_code;
      
      if (detectedCountry && countryCurrencyMap[detectedCountry]) {
        const detectedCurrency = countryCurrencyMap[detectedCountry];
        setCurrencyState(currencies[detectedCurrency]);
      }
    } catch (error) {
      console.log('Could not detect currency, using USD as default');
      // Keep USD as default
    }
  };

  useEffect(() => {
    // Try to get saved currency from localStorage
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(currencies[savedCurrency]);
      return;
    }

    // Auto-detect based on location
    detectCurrency();
  }, []);

  const setCurrency = (code: string) => {
    if (currencies[code]) {
      setCurrencyState(currencies[code]);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const availableCurrencies = Object.values(currencies);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, availableCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
