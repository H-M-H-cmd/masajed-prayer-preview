'use client'

import Link from 'next/link'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useUser } from '@/stores/user.store'
import { type User } from '@/components/layout/types'
import { useAuth } from '@/providers/auth-provider'
export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar()
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  const { isLoading } = useUser()
  const { logout } = useAuth()

  // Don't render anything while loading to avoid flashing
  if (isLoading) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-lg'>
                  {user.name?.split(' ')[0].substring(0, 1)}
                  {user.name?.split(' ')[1].substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight relative'>
                <span className='truncate font-semibold'>{user.name}</span>
                <span className='truncate text-xs'>{user.panel}</span>
              </div>
              <ChevronsUpDown className={cn('ms-auto size-4', isRTL && 'rotate-180')} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : isRTL ? 'left' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                  <AvatarFallback className='rounded-lg'>
                    {user.name?.split(' ')[0].substring(0, 1)}
                    {user.name?.split(' ')[1].substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs'>{user.panel}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='/settings/account'>
                  <BadgeCheck className={isRTL ? 'ms-2' : 'me-2'} />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings/notifications'>
                  <Bell className={isRTL ? 'ms-2' : 'me-2'} />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className={isRTL ? 'ms-2' : 'me-2'} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}