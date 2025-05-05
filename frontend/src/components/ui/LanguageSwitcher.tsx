'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, Locale, locales } from '@/i18n/i18n';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

export default function LanguageSwitcher() {
  const { locale, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageChange = (newLocale: Locale) => {
    changeLanguage(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded-md p-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Change language"
      >
        <FaGlobe className="mr-1" aria-hidden="true" />
        <span className="sr-only md:not-sr-only md:inline">{locales[locale]}</span>
        <FaChevronDown className="ml-1 h-3 w-3" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {Object.entries(locales).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as Locale)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  locale === code
                    ? 'bg-gray-100 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}