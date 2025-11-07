// Currency mapping based on country codes (ISO 3166-1 alpha-2)
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // North America
  'US': 'USD',
  'CA': 'CAD',
  'MX': 'MXN',

  // Europe
  'GB': 'GBP',
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'NL': 'EUR',
  'BE': 'EUR',
  'AT': 'EUR',
  'CH': 'CHF',
  'SE': 'SEK',
  'NO': 'NOK',
  'DK': 'DKK',
  'FI': 'EUR',
  'PL': 'PLN',
  'CZ': 'CZK',
  'HU': 'HUF',
  'RO': 'RON',
  'BG': 'BGN',
  'GR': 'EUR',
  'PT': 'EUR',
  'IE': 'EUR',
  'LU': 'EUR',
  'MT': 'EUR',
  'CY': 'EUR',
  'SI': 'EUR',
  'SK': 'EUR',
  'EE': 'EUR',
  'LV': 'EUR',
  'LT': 'EUR',
  'HR': 'EUR',

  // Asia Pacific
  'JP': 'JPY',
  'CN': 'CNY',
  'KR': 'KRW',
  'SG': 'SGD',
  'AU': 'AUD',
  'NZ': 'NZD',
  'HK': 'HKD',
  'TW': 'TWD',
  'TH': 'THB',
  'MY': 'MYR',
  'ID': 'IDR',
  'PH': 'PHP',
  'VN': 'VND',
  'IN': 'INR',
  'PK': 'PKR',
  'BD': 'BDT',
  'LK': 'LKR',

  // Middle East & Africa
  'AE': 'AED',
  'SA': 'SAR',
  'QA': 'QAR',
  'KW': 'KWD',
  'BH': 'BHD',
  'OM': 'OMR',
  'JO': 'JOD',
  'LB': 'LBP',
  'IL': 'ILS',
  'EG': 'EGP',
  'ZA': 'ZAR',
  'NG': 'NGN',
  'KE': 'KES',
  'GH': 'GHS',
  'TN': 'TND',
  'MA': 'MAD',
  'DZ': 'DZD',

  // South America
  'BR': 'BRL',
  'AR': 'ARS',
  'CL': 'CLP',
  'CO': 'COP',
  'PE': 'PEN',
  'VE': 'VES',
  'UY': 'UYU',
  'PY': 'PYG',
  'BO': 'BOB',
  'EC': 'USD', // Ecuador uses USD
  'GY': 'GYD',
  'SR': 'SRD',

  // Central America & Caribbean
  'CR': 'CRC',
  'PA': 'PAB',
  'SV': 'USD', // El Salvador uses USD
  'HN': 'HNL',
  'NI': 'NIO',
  'GT': 'GTQ',
  'BZ': 'BZD',
  'JM': 'JMD',
  'HT': 'HTG',
  'DO': 'DOP',
  'CU': 'CUP',
  'BS': 'BSD',
  'TT': 'TTD',
  'BB': 'BBD',
};

export interface GeolocationData {
  ip: string;
  country_code: string;
  country_name: string;
  city?: string;
  region?: string;
  timezone?: string;
  currency?: string;
}

export class GeolocationService {
  // Get user's IP and location data
  static async getUserLocation(): Promise<GeolocationData | null> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data: GeolocationData = await response.json();

      // Add currency based on country
      data.currency = COUNTRY_CURRENCY_MAP[data.country_code] || 'USD';

      console.log('User location detected:', {
        ip: data.ip,
        country: data.country_name,
        currency: data.currency
      });

      return data;
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
    }
  }

  // Get currency for a specific country code
  static getCurrencyForCountry(countryCode: string): string {
    return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  }

  // Get country code for a specific currency (reverse lookup)
  static getCountryForCurrency(currency: string): string | null {
    for (const [countryCode, countryCurrency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
      if (countryCurrency === currency) {
        return countryCode;
      }
    }
    return null;
  }

  // Get all supported currencies
  static getSupportedCurrencies(): string[] {
    return [...new Set(Object.values(COUNTRY_CURRENCY_MAP))].sort();
  }

  // Validate currency code
  static isValidCurrency(currency: string): boolean {
    return Object.values(COUNTRY_CURRENCY_MAP).includes(currency);
  }
}
