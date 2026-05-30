// Global Multi-Currency and Localization Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CURRENCY_LOCALE_MAP, SUPPORTED_LOCALES } from '../utils/localeConfig';
import { formatLocaleDate } from '../utils/dateFormatter';

const CurrencyContext = createContext(null);

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  AED: 'AED ',
  SAR: 'SAR ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$'
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('expenseso_currency') || 'INR';
  });

  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('expenseso_locale') || 'en-IN';
  });

  const setCurrency = useCallback((newCurrency) => {
    if (!CURRENCY_SYMBOLS[newCurrency]) return;
    
    // Write currency to localStorage
    setCurrencyState(newCurrency);
    localStorage.setItem('expenseso_currency', newCurrency);

    // Automatically update matching locale
    const matchingLocale = CURRENCY_LOCALE_MAP[newCurrency] || 'en-US';
    setLocaleState(matchingLocale);
    localStorage.setItem('expenseso_locale', matchingLocale);
    
    // Update document dir attribute for RTL support if ar-AE
    const localeConfig = SUPPORTED_LOCALES[matchingLocale] || { dir: 'ltr' };
    document.documentElement.dir = localeConfig.dir;
    document.documentElement.lang = matchingLocale;
  }, []);

  // Sync HTML structure on load
  useEffect(() => {
    const activeLocale = localStorage.getItem('expenseso_locale') || 'en-IN';
    const localeConfig = SUPPORTED_LOCALES[activeLocale] || { dir: 'ltr' };
    document.documentElement.dir = localeConfig.dir;
    document.documentElement.lang = activeLocale;
  }, []);

  // Formatter utility matching Intl norms
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null) return `${CURRENCY_SYMBOLS[currency] || ''}0`;
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    try {
      // Custom format for AED/SAR to enforce 'AED 5,000' style
      if (currency === 'AED' || currency === 'SAR') {
        const value = parsed.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
        return `${CURRENCY_SYMBOLS[currency]}${value}`;
      }

      // Standard locales (e.g. en-IN for lakh separators ₹1,25,000)
      const localeCode = locale;
      return parsed.toLocaleString(localeCode, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    } catch (err) {
      // Fallback in case of failures
      const symbol = CURRENCY_SYMBOLS[currency] || '';
      return `${symbol}${parsed.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })}`;
    }
  }, [currency, locale]);

  const formatDate = useCallback((dateInput, style = 'medium') => {
    return formatLocaleDate(dateInput, style, locale);
  }, [locale]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      locale,
      currencySymbol: CURRENCY_SYMBOLS[currency] || '₹',
      setCurrency,
      formatCurrency,
      formatDate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
