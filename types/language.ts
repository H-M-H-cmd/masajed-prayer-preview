export type Language = 'ar' | 'en';

export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: 'rtl' | 'ltr';
} 