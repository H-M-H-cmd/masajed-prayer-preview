"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"
import { useLanguage } from "@/providers/language-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbSegment {
title: string
href: string
  isLast: boolean
}

export function BreadcrumbNav() {
  const segments = useSelectedLayoutSegments()
  const { t, language } = useLanguage()
  const isRTL = language === 'ar'

  const breadcrumbs = React.useMemo(() => {
    const items: BreadcrumbSegment[] = []
    let href = '/dashboard'

    // Add segments one by one
    segments.forEach((segment, index) => {
      // Skip any segments you want to hide
      if (segment === '(dashboard)' || segment === '(auth)') return

      href = `${href}/${segment}`
      const isLast = index === segments.length - 1

      // Handle dynamic segments (those starting with [ or uuids)
      const isDynamic = segment.startsWith('[') || /^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      
      let title = ''
      if (isDynamic) {
        // For dynamic segments, use the previous segment's context
        const contextSegment = segments[index - 1]
        title = t(`pages.${contextSegment}.item`) || segment
      } else {
        // For normal segments
        title = t(`pages.${segment}.title`) || segment
      }

      items.push({
        title,
        href,
        isLast
      })
    })

    return items
  }, [segments, t])

  if (!breadcrumbs.length) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className={cn(
        "animate-in fade-in-50 duration-500",
        isRTL ? "slide-in-from-right-8" : "slide-in-from-left-8"
      )}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Home className="h-4 w-4" />
              <span>{t('pages.dashboard.title')}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map(({ title, href, isLast }) => (
          <React.Fragment key={href}>
            <BreadcrumbSeparator className={cn(
              "text-muted-foreground/40",
              isRTL && "rotate-180"
            )} />
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage>{title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link 
                    href={href}
                    className="transition-colors hover:text-primary"
                  >
                    {title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 