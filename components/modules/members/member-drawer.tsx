"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useLanguage } from "@/providers/language-provider"
import { UpdateCreateForm } from "./form/update-create"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CreateMosqueMemberData, MosqueMember } from "@/types/mosque-member"

interface MemberDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: MosqueMember
  onSubmit: (data: CreateMosqueMemberData) => Promise<void>
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function MemberDrawer({ 
  open, 
  onOpenChange, 
  member, 
  onSubmit, 
  isLoading,
  mode 
}: MemberDrawerProps) {
  const { t, direction } = useLanguage()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={direction === 'rtl' ? 'left' : 'right'} 
          className="w-full max-w-[540px] md:w-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {mode === 'create' ? t('members.addMember') : t('members.editMember')}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <UpdateCreateForm 
              member={member} 
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
              {mode === 'create' ? t('members.addMember') : t('members.editMember')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <UpdateCreateForm 
              member={member} 
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 