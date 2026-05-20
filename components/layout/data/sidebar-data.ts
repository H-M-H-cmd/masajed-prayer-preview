import {
  // IconBug,
  // IconChecklist,
  // IconError404,
  // IconHelp,
  IconLayoutDashboard,
  // IconLock,
  // IconNotification,
  // IconPalette,
  // IconServerOff,
  // IconSettings,
  // IconTool,
  // IconUserCog,
  IconUsers,
  IconBuilding,
} from '@tabler/icons-react'
import { Building2 } from 'lucide-react'
import { type SidebarData } from '@/components/layout/types'
import { useAuth } from '@/providers/auth-provider'

export const useCreateSidebarData = (t: (key: string) => string): SidebarData => {
  const { user } = useAuth()
  return {
  user: {
    name: user?.name || '',
    panel: user?.panel?.name || '',
    avatar: user?.avatar || '',
  },
  teams: [
    {
      name: user?.panel?.name || '',
      logo: Building2,
      role: user?.panel?.type || '',
    },
  ],
  navGroups: [
    {
      title: t('sidebar.overview.title'),
      items: [
        {
          title: t('sidebar.overview.dashboard'),
          url: '/dashboard',
          icon: IconLayoutDashboard,
          commandKey: 'd',
        },
        {
          title: t('sidebar.overview.mosques'),
          url: '/dashboard/mosques',
          icon: IconBuilding,
          commandKey: 'm',
        },
      ],
    },
    {
      title: t('sidebar.userManagement.title'),
      items: [
        {
          title: t('sidebar.userManagement.members'),
          url: '/dashboard/members',
          icon: IconUsers,
        },
      ],
    },
    ],
  }
}
