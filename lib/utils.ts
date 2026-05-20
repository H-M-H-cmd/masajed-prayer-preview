import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const validateSaudiId = (id: string): boolean => {
  // Basic checks
  if (!/^\d{10}$/.test(id) || id[0] !== '1') {
    return false;
  }

  // Step 1: Multiply odd positions by 2 and sum digits if result is 2 digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]);
    if (i % 2 === 0) { // Odd position (0-based index)
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    sum += digit;
  }

  // Get the last digit of sum (Y)
  const y = sum % 10;
  const lastDigit = parseInt(id[9]);

  // Check if last digit is zero
  if (lastDigit === 0) {
    return (10 - y) === 10;
  }

  return (10 - y) === lastDigit;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
