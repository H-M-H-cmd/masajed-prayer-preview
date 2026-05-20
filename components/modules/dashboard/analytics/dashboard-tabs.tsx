'use client'

import { Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Overview } from "./tabs/overview"
import { Analytics } from "./tabs/analytics"
import { Reports } from "./tabs/reports"
import { Notifications } from "./tabs/notifications"
import { useLanguage } from "@/providers/language-provider"
import { cn } from "@/lib/utils"

export function DashboardTabs() {
  const { t, language } = useLanguage()

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="overview" className="flex-1 space-y-4">
          <div className="flex items-center justify-between rtl:flex-row-reverse">
            <TabsList className={cn(
              language === 'ar' && "flex-row-reverse"
            )}>
              <TabsTrigger value="overview">{t('sidebar.overview.title')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('sidebar.overview.dashboard')}</TabsTrigger>
              <TabsTrigger value="reports">{t('sidebar.reports')}</TabsTrigger>
              <TabsTrigger value="notifications">{t('sidebar.notifications')}</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <Overview />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Reports />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <Notifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 