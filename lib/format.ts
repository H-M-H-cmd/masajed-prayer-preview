/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: SAR)
 * @param language The language code (default: 'ar')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'SAR',
  language: string = 'ar'
): string => {
  // Use locale based on language
  // const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  // Format number according to locale
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  // Add the appropriate currency symbol based on currency and language
  switch (currency) {
    case 'SAR':
      return language === 'ar' 
        ? `${formattedNumber}` 
        : `${formattedNumber}`;
    default:
      return `${currency} ${formattedNumber}`;
  }
};

/**
 * Format a number with commas
 * @param number The number to format
 * @param language The language code (default: 'ar')
 * @returns Formatted number string
 */
export const formatNumber = (
  number: number,
  // language: string = 'ar'
): string => {
  // Use locale based on language
  // const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format a percentage
 * @param value The value to format as percentage
 * @param language The language code (default: 'ar')
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  // language: string = 'ar'
): string => {
  // Use locale based on language
  // const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value / 100);
};

/**
 * Format a date string
 * @param dateString The date string to format
 * @param language The language code (default: 'ar')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  language: string = 'ar'
): string => {
  const date = new Date(dateString);
  
  // Use Intl.DateTimeFormat for localized date formatting
  const formatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  // Format with formatter then replace slashes with dashes
  return formatter.format(date).replace(/\//g, '-');
};

export function formatTimeAgo(startDate: string, endDate: string, language: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMilliseconds = end.getTime() - start.getTime();
  
  const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (language === 'ar') {
    if (days > 0) {
      return `${days} يوم ${hours > 0 ? `و ${hours} ساعة` : ''}`;
    }
    return `${hours} ساعة`;
  } else {
    if (days > 0) {
      return `${days} days ${hours > 0 ? `and ${hours} hours` : ''}`;
    }
    return `${hours} hours`;
  }
} 