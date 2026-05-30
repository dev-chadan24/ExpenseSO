// Centralized formatting utilities for ExpenseSO
import { format, parseISO } from 'date-fns'
import { formatLocaleDate } from './dateFormatter'

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

/**
 * Formats a number as currency based on active currency/locale settings.
 * @param {number|string} amount 
 * @param {string} customSymbol - optional override
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, customSymbol = null) => {
  if (amount === undefined || amount === null) return '';
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(parsed)) return '';

  const activeCurrency = localStorage.getItem('expenseso_currency') || 'INR';
  const activeLocale = localStorage.getItem('expenseso_locale') || 'en-IN';
  const symbol = customSymbol || CURRENCY_SYMBOLS[activeCurrency] || '₹';

  try {
    // Custom separation layout for AED and SAR (e.g. AED 5,000)
    if (activeCurrency === 'AED' || activeCurrency === 'SAR') {
      const value = parsed.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      return `${symbol}${value}`;
    }

    // Standard locale formatting
    return parsed.toLocaleString(activeLocale, {
      style: 'currency',
      currency: activeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  } catch (err) {
    // Fallback format
    const value = parsed.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${symbol}${value}`;
  }
};

/**
 * Formats date into locale-aware format (e.g. 24 May 2026).
 * @param {string|Date} dateStr 
 * @param {string} formatStr - optional legacy format string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, formatStr = null) => {
  if (!dateStr) return '';
  
  const activeLocale = localStorage.getItem('expenseso_locale') || 'en-IN';

  // If a custom layout format other than standard is requested, process via date-fns
  if (formatStr && formatStr !== 'MMM dd, yyyy') {
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
      return format(date, formatStr);
    } catch {
      return formatLocaleDate(dateStr, 'medium', activeLocale);
    }
  }

  return formatLocaleDate(dateStr, 'medium', activeLocale);
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
