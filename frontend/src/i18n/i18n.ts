import { useEffect, useState } from 'react';

// Import all locale files
import en from './locales/en.json';
import es from './locales/es.json';

// Type definitions
export type Locale = 'en' | 'es';
export type TranslationKey = string;

// Define available locales
export const locales: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

// Store translations
const translations: Record<Locale, Record<string, any>> = {
  en,
  es,
};

// Get browser language
export const getBrowserLanguage = (): Locale => {
  if (typeof window === 'undefined') return 'en'; // Default to English on server
  
  const navigatorLanguage = 
    navigator.language || 
    (navigator as any).userLanguage || // For older browsers
    'en';
  
  const language = navigatorLanguage.split('-')[0]; // Get language code without region
  
  return (language in translations) ? (language as Locale) : 'en';
};

// Get stored language preference
export const getStoredLanguage = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  
  const storedLanguage = localStorage.getItem('farm2fork_language');
  return (storedLanguage && storedLanguage in translations) 
    ? (storedLanguage as Locale) 
    : getBrowserLanguage();
};

// Set language preference
export const setLanguage = (locale: Locale): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('farm2fork_language', locale);
    document.documentElement.lang = locale;
  }
};

// Translate a string key
export const translate = (key: TranslationKey, locale: Locale, params?: Record<string, string | number>): string => {
  // Split the key into parts (e.g., "common.buttons.save" -> ["common", "buttons", "save"])
  const parts = key.split('.');
  
  // Start from the root of the translations object
  let result: any = translations[locale];
  
  // Traverse the object following the parts
  for (const part of parts) {
    if (result && part in result) {
      result = result[part];
    } else {
      console.warn(`Translation key not found: ${key} in locale ${locale}`);
      return key; // Return the key itself as fallback
    }
  }
  
  // If the result is a string, we found our translation
  if (typeof result === 'string') {
    // Replace parameters if any
    if (params) {
      return result.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => 
        paramKey in params ? String(params[paramKey]) : `{{${paramKey}}}`
      );
    }
    return result;
  }
  
  // If the result is not a string, it's an object that doesn't match our key
  console.warn(`Translation value is not a string: ${key} in locale ${locale}`);
  return key;
};

// React hook for using translations
export const useTranslation = () => {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English
  
  // Initialize locale from storage or browser on mount
  useEffect(() => {
    setLocale(getStoredLanguage());
  }, []);
  
  // Function to change the language
  const changeLanguage = (newLocale: Locale) => {
    setLanguage(newLocale);
    setLocale(newLocale);
  };
  
  // Shorthand translation function with current locale
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return translate(key, locale, params);
  };
  
  return {
    t,
    locale,
    changeLanguage,
    locales,
  };
};