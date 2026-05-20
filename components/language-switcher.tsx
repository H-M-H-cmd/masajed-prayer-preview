'use client';

import { useLanguage } from '@/providers/language-provider';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLanguageToggle}
        aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={language}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-5 h-5"
          >
            <Image
              src={`/assets/flags/${language === 'ar' ? 'gb' : 'sa'}.svg`}
              alt={language === 'ar' ? 'English' : 'العربية'}
              fill
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}; 