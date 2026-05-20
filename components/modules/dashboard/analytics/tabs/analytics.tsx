'use client'

import { useLanguage } from "@/providers/language-provider"

export function Analytics() {
  const { t } = useLanguage()
  
  return (
    <div className="flex h-[450px] items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">{t('common.noData')}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          {t('common.comingSoon')}
        </p>
      </div>
    </div>
  )
} 