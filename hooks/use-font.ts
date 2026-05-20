import { useLanguage } from "@/providers/language-provider";

export const useFont = () => {
  const { language } = useLanguage();
  return language === 'ar' ? 'font-arabic' : 'font-sans';
}; 