'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, LanguageContextType } from '@/types/language';
import translations from '@/translations';
import { storage } from '@/lib/storage';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'app-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLanguage = storage.get(LANGUAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
      setDirection(savedLanguage === 'ar' ? 'rtl' : 'ltr');
    } else {
      setLanguageState('ar');
      setDirection('rtl');
      storage.set(LANGUAGE_KEY, 'ar');
    }
    document.documentElement.dir = direction;
    setIsLoaded(true);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    const newDirection = newLanguage === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    storage.set(LANGUAGE_KEY, newLanguage);
    document.documentElement.dir = newDirection;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }

    return value || key;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      <div dir={direction}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 