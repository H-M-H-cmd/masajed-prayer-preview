'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { useCreateSidebarData } from './data/sidebar-data'
import { useLanguage } from '@/providers/language-provider'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { language, t } = useLanguage()
  const isRTL = language === 'ar'
  const sidebarData = useCreateSidebarData(t)
  

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      side={isRTL ? 'right' : 'left'}
      className="bg-background dark:bg-background transition-transform duration-300"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea dir={isRTL ? 'rtl' : 'ltr'} className='h-full'>
          {sidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}