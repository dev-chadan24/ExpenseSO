// Locale configurations for ExpenseSO
export const SUPPORTED_LOCALES = {
  'en-IN': { code: 'en-IN', name: 'India (English)', dir: 'ltr', defaultCurrency: 'INR' },
  'en-US': { code: 'en-US', name: 'United States (English)', dir: 'ltr', defaultCurrency: 'USD' },
  'en-GB': { code: 'en-GB', name: 'United Kingdom (English)', dir: 'ltr', defaultCurrency: 'GBP' },
  'ar-AE': { code: 'ar-AE', name: 'United Arab Emirates (Arabic)', dir: 'rtl', defaultCurrency: 'AED' }
};

export const DEFAULT_LOCALE = 'en-IN';

// Map currency codes to their default standard locales
export const CURRENCY_LOCALE_MAP = {
  INR: 'en-IN',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'en-US', // standard fallback for international EUR formatting
  AED: 'ar-AE',
  SAR: 'ar-AE', // or ar-SA
  SGD: 'en-US', // en-SG
  AUD: 'en-AU',
  CAD: 'en-CA'
};
