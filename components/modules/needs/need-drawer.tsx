"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useLanguage } from "@/providers/language-provider"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Need, CreateNeedData } from "@/types/need"
import { UpdateCreateForm } from "./form/update-create"

interface NeedDrawerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	need?: Need
	onSubmit: (data: CreateNeedData) => Promise<void>
	isLoading?: boolean
	mode?: 'create' | 'edit'
}

export function NeedDrawer({
	open,
	onOpenChange,
	need,
	onSubmit,
	isLoading,
	mode = 'create'
}: NeedDrawerProps) {
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
							{mode === 'create' ? t('needs.addNeed') : t('needs.editNeed')}
						</SheetTitle>
					</SheetHeader>
					<div className="mt-4">
						<UpdateCreateForm
							need={need}
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
							{mode === 'create' ? t('needs.addNeed') : t('needs.editNeed')}
						</DrawerTitle>
					</DrawerHeader>
					<div className="p-4">
						<UpdateCreateForm
							need={need}
							onSubmit={onSubmit}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}