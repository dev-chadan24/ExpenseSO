// Localization date formatter for ExpenseSO
import { DEFAULT_LOCALE } from './localeConfig';

/**
 * Formats a date string or object into a localized string.
 * @param {string|Date} dateInput - ISO string or Date object
 * @param {string} style - 'medium' (e.g. 24 May 2026) or 'short' (e.g. 24/05/2026)
 * @param {string} activeLocale - Active locale code (defaults to en-IN)
 * @returns {string} Formatted date
 */
export const formatLocaleDate = (dateInput, style = 'medium', activeLocale = null) => {
  if (!dateInput) return '';
  
  const locale = activeLocale || localStorage.getItem('expenseso_locale') || DEFAULT_LOCALE;
  
  let date;
  try {
    date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return dateInput;
  } catch (err) {
    console.error('Error parsing date for localization:', dateInput, err);
    return dateInput;
  }

  // Handle formats based on style
  if (style === 'short') {
    // Return numeric date representation (e.g. 24/05/2026)
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  // Medium format (e.g. 24 May 2026)
  // Intl format can include commas or differ by locale. We can enforce format parts or standard format.
  // Standard format using Intl parts is extremely predictable:
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // For ar-AE or other non-English locales, let it format natively.
    // For English locales (en-IN, en-GB, en-US), let's ensure '24 May 2026' style
    if (locale.startsWith('en')) {
      const parts = formatter.formatToParts(date);
      const day = parts.find(p => p.type === 'day')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';
      // Enforce: Day Month Year (no comma, space separated)
      return `${day} ${month} ${year}`;
    }

    return formatter.format(date);
  } catch (err) {
    return date.toLocaleDateString(locale);
  }
};
