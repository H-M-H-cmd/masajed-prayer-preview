"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useLanguage } from "@/providers/language-provider"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Event } from "@/types/event"
import { UpdateCreateForm } from "./form/update-create"
import { type CreateEventData } from "@/types/event"

interface EventDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
  onSubmit: (data: CreateEventData) => Promise<void>
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function EventDrawer({
  open,
  onOpenChange,
  event,
  onSubmit,
  isLoading,
  mode
}: EventDrawerProps) {
  const { t, direction } = useLanguage()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={direction === 'rtl' ? 'left' : 'right'}
          className="w-full sm:max-w-4xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {mode === 'create' ? t('events.addEvent') : t('events.editEvent')}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <UpdateCreateForm
              event={event}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              {mode === 'create' ? t('events.addEvent') : t('events.editEvent')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <UpdateCreateForm
              event={event}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 