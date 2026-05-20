'use client'

import * as React from 'react'
import { Building2, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLanguage } from '@/providers/language-provider'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { Panel } from '@/services/auth.service'
import { type Team } from '@/components/layout/types'

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const { isMobile } = useSidebar()
  const { t } = useLanguage()
  const { user } = useAuth()
  const [activePanel, setActivePanel] = React.useState<Panel | null>(user?.panel || null)

  // Update active panel when user changes
  React.useEffect(() => {
    if (user?.panel) {
      setActivePanel(user.panel)
    }
    // console.log(teams)
  }, [user, teams])

  if (!user || !activePanel) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <Building2 className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activePanel.name}
                </span>
                <span className='truncate text-xs capitalize'>{activePanel.type}</span>
              </div>
              <ChevronsUpDown className={cn('ms-auto size-4')} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              {t('mosques.title')}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setActivePanel(user.panel)}
              className='gap-2 p-2'
            >
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Building2 className='size-4 shrink-0' />
              </div>
              <div className='flex flex-1 flex-col'>
                <span className='text-sm font-medium'>{user.panel.name}</span>
                <span className='text-xs text-muted-foreground capitalize'>{user.panel.type}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-muted-foreground'>
                {t('mosques.create.title')}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}