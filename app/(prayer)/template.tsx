"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get the base path to determine if we're in the same section
  const getBasePath = (path: string) => {
    const segment = path.split('/').filter(Boolean)[0];
    return segment ? `/${segment}` : '/';
  };

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait" >
      <motion.main
        key={getBasePath(pathname)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="container max-w-lg mx-auto p-4"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
} 