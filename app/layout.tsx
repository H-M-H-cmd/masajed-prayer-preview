import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic, Tajawal } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { Toaster } from "@/components/ui/sonner";

// Font for both English and Arabic text
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-kufi',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Masajid Prayer — Preview",
  description: "Standalone preview of the prayer experience (mock data only)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.variable} ${notoKufiArabic.variable} ${tajawal.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Toaster />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
