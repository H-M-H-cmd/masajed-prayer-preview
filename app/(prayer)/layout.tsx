"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { IslamicPattern } from "@/components/ui/pattern";
import { AppLogo } from "@/components/app-logo";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { cn } from "@/lib/utils";
import {
  HandHeart,
  Calendar,
  Wrench
} from "lucide-react";
import { IconBuildingMosque } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, usePathname } from "next/navigation";

// Create a wrapper component for Tabler icons
const TablerIconWrapper = (Icon: typeof IconBuildingMosque) => {
  return function WrappedIcon(props: React.ComponentProps<typeof IconBuildingMosque>) {
    return <Icon {...props} />;
  };
};

interface PrayerLayoutProps {
  children: React.ReactNode;
}

export default function PrayerLayout({ children }: PrayerLayoutProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mosqueName = "مسجد ابو بكر الصديق"; // This should come from a context or prop

  const tabs = [
    {
      title: t('prayer.nav.main'),
      icon: TablerIconWrapper(IconBuildingMosque),
      href: '/'
    },
    {
      title: t('prayer.nav.events'),
      icon: Calendar,
      href: '/events'
    },
    {
      title: t('prayer.nav.donate'),
      icon: HandHeart,
      href: '/donate'
    },
    {
      title: t('prayer.nav.issues'),
      icon: Wrench,
      href: '/issues'
    },
  ];

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      router.push(tabs[index].href);
    }
  };

  // Get the base path to determine which tab should be active
  const getBasePath = (path: string) => {
    const segment = path.split('/').filter(Boolean)[0];
    return segment ? `/${segment}` : '/';
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background">
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative isolate">
      {/* Fixed Islamic Pattern Background */}
      <div className="fixed inset-0 z-0">
        <IslamicPattern />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Fixed Header */}
        <header className={cn(
          "sticky top-0 z-50",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-b"
        )}>
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className={cn(
              "text-lg font-semibold text-primary flex items-center gap-2",
            )}>
              <AppLogo showText={false} className={cn(
                language === 'ar' ? "-mr-2" : "-ml-2"
              )} />
              {mosqueName || t('prayer.title')}
            </h1>
            <div className={cn(
              "flex items-center gap-2",
              language === 'ar' ? "flex-row-reverse" : "flex-row"
            )}>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content with ScrollArea */}
        <ScrollArea className="flex-1 relative">
          {children}
        </ScrollArea>

        {/* Fixed Bottom Navigation */}
        <div className={cn(
          "sticky bottom-0 z-50",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-t p-2"
        )}>
          <div className="flex justify-center max-w-lg mx-auto px-4  z-50">
            <ExpandableTabs
              tabs={tabs}
              onChange={handleTabChange}
              className="w-fit"
              activeColor="text-primary"
              currentPath={getBasePath(pathname)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}