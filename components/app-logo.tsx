"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import Link from "next/link";
import Image from "next/image";

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export function AppLogo({ className, showText = true }: AppLogoProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Link
        href="/"
        className="flex items-center gap-3 font-medium transition-colors hover:text-primary"
        tabIndex={0}
      >
        <div className="relative flex h-8 w-8 items-center justify-center">
          <Image
            src="/assets/logo.svg"
            alt={t('common.appName')}
            width={32}
            height={32}
            className="h-full w-full object-contain "
            priority
          />
        </div>
        {showText && (
          <span className="text-lg font-semibold">
            {t('common.appName')}
          </span>
        )}
      </Link>
    </motion.div>
  );
} 