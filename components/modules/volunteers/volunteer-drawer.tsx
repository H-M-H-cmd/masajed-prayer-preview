"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useLanguage } from "@/providers/language-provider"
import { useMediaQuery } from "@/hooks/use-media-query"
import { VolunteerOpportunity } from "@/types/volunteer"
import { UpdateCreateForm } from "./form/update-create"
import { VolunteerFormValues } from "./schema"

interface VolunteerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  volunteer?: VolunteerOpportunity
  onSubmit: (data: VolunteerFormValues) => Promise<void>
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function VolunteerDrawer({ 
  open, 
  onOpenChange, 
  volunteer, 
  onSubmit, 
  isLoading,
  mode 
}: VolunteerDrawerProps) {
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
                {mode === 'create' ? t('volunteers.drawer.createTitle') : t('volunteers.drawer.editTitle')}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <UpdateCreateForm 
              volunteer={volunteer} 
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
                {mode === 'create' ? t('volunteers.drawer.createTitle') : t('volunteers.drawer.editTitle')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <UpdateCreateForm 
              volunteer={volunteer} 
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}