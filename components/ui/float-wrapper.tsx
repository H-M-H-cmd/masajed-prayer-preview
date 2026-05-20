'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const FloatWrapper = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
        times: [0, 0.5, 1]
      }}
    >
      {children}
    </motion.div>
  );
}; 