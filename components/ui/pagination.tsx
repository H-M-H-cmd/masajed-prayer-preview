"use client";

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/language-provider"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPageInfo?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageInfo = true,
}: PaginationProps) {
  const { language } = useLanguage()

  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1))
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-4",
        language === 'ar' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={language === 'ar' ? handleNext : handlePrevious}
        disabled={language === 'ar' ? currentPage === totalPages : currentPage === 1}
        className={cn(
          "h-8 w-8 transition-colors",
          "hover:bg-muted",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:ring-1 focus-visible:ring-primary"
        )}
        aria-label={language === 'ar' ? "الصفحة التالية" : "Previous page"}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageInfo && (
        <div className="flex items-center gap-1 min-w-[5rem] justify-center text-sm">
          <span className="font-medium">{currentPage}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{totalPages}</span>
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={language === 'ar' ? handlePrevious : handleNext}
        disabled={language === 'ar' ? currentPage === 1 : currentPage === totalPages}
        className={cn(
          "h-8 w-8 transition-colors",
          "hover:bg-muted",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:ring-1 focus-visible:ring-primary"
        )}
        aria-label={language === 'ar' ? "الصفحة السابقة" : "Next page"}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 