'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/providers/language-provider';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const [prevLanguage, setPrevLanguage] = useState(language);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && language !== prevLanguage) {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setPrevLanguage(language);
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [language, prevLanguage, mounted]);

  const variants = {
    initial: { 
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0,
      y: -20,
      scale: 0.98
    }
  };

  return (
    <div className="w-full min-h-screen">
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          key={mounted ? language : 'initial'}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            opacity: {
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            },
            scale: {
              type: "spring",
              stiffness: 100,
              damping: 20
            },
            y: {
              type: "spring",
              stiffness: 100,
              damping: 20
            }
          }}
          className={cn(
            "w-full min-h-screen transition-all",
            isAnimating && "pointer-events-none"
          )}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => {
            setTimeout(() => {
              setIsAnimating(false);
            }, 100);
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 