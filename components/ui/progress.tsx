"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'success';
  showPercentage?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'default', showPercentage = false, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === "ar"

  const percentage = Math.round(value || 0)
  const percentagePosition = `${Math.min(Math.max(percentage, 3), 97)}%`

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            variant === 'success' ? "bg-green-500" : "bg-primary",
          )}
          style={{ 
            transform: isRTL 
              ? `translateX(${100 - percentage}%)`
              : `translateX(-${100 - percentage}%)`
          }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <span 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-xs font-medium text-white",
            "transition-all duration-200"
          )}
          style={{ 
            [isRTL ? 'right' : 'left']: percentagePosition,
            transform: `translate${isRTL ? '(110%, -40%)' : '(-110%, -40%)'}`
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
