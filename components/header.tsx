'use client';

import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { useLanguage } from '@/providers/language-provider';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from './app-logo';
import Link from 'next/link';

export const Header = () => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const headerBackgroundOpacity = useTransform(
    scrollY,
    [0, 50],
    [0.5, 0.95]
  );
  
  const headerBlur = useTransform(
    scrollY,
    [0, 50],
    [8, 16]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#donate', label: 'nav.donate' },
    { href: '#about', label: 'nav.about' },
    { href: '#impact', label: 'nav.impact' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 w-full z-50 [direction:ltr]",
        isScrolled && "shadow-lg shadow-primary/5"
      )}
      style={{
        backgroundColor: `hsl(var(--background) / ${headerBackgroundOpacity})`,
        backdropFilter: `blur(${headerBlur}px)`,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <div className="absolute inset-0 backdrop-blur-[8px]" />
        </div>

        <div className="flex h-16 items-center justify-between px-4 relative">
          <motion.div 
            className="flex items-center gap-3 w-[200px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AppLogo />
          </motion.div>

          <nav className="hidden md:flex items-center justify-center flex-1">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-sm font-medium relative group py-2 px-4 transition-colors hover:text-primary"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {t(item.label)}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary/50 to-primary rounded-full"
                  initial={{ width: '0%' }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <motion.div 
            className="flex items-center gap-4 w-[200px] justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button size="sm">
                  {t('auth.login')}
                </Button>
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-4 border-s border-border/50">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>

            <motion.button
              className="p-2 md:hidden rounded-md hover:bg-primary/10 transition-colors menu-button"
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="md:hidden mobile-menu"
        initial={false}
        animate={{ 
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        style={{
          backgroundColor: `hsl(var(--background) / ${headerBackgroundOpacity})`,
          backdropFilter: `blur(${headerBlur}px)`,
          overflow: 'hidden'
        }}
      >
        <div className="border-t border-border/10 py-4">
          <div className="flex items-center justify-center px-4 pb-4 mb-4 border-b border-border/10">
            <Link href="/login" className="w-full">
              <Button size="sm" className="w-full">
                {t('auth.login')}
              </Button>
            </Link>
          </div>

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-sm hover:bg-primary/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t(item.label)}
            </a>
          ))}

          <div className="flex sm:hidden items-center justify-center gap-4 p-4 border-t border-border/10">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}; 