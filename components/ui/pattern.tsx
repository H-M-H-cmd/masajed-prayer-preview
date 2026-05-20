'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const IslamicPattern = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a simpler version initially
  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <Image
            src="/assets/islamic.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.15] dark:opacity-[0.08] dark:invert object-center"
            priority
            quality={100}
            sizes="100vw"
          />
        </div>
      </div>
    );
  }

  const gradientStyle = {
    background: `radial-gradient(
      circle at center,
      hsl(var(--background) / 0) 0%,
      hsl(var(--background) / 0.2) 30%,
      hsl(var(--background) / 0.7) 60%,
      hsl(var(--background) / 0.95) 80%,
      hsl(var(--background)) 100%
    )`
  };

  const glowStyle = {
    background: `radial-gradient(
      circle at center,
      hsl(var(--foreground) / ${theme === 'dark' ? '0.03' : '0.015'}) 0%,
      transparent 70%
    )`
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base Pattern Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/islamic.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.15] dark:opacity-[0.08] dark:invert object-center"
          priority
          quality={100}
          sizes="100vw"
          style={{
            objectFit: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>

      {/* Radial Gradient Overlay */}
      <div 
        className="absolute inset-0" 
        style={gradientStyle}
      />

      {/* Center Glow */}
      <div 
        className="absolute inset-0" 
        style={glowStyle}
      />
    </div>
  );
}; 