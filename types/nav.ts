import { LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  url?: string
  icon?: React.ElementType
  badge?: string
  items?: Omit<NavItem, 'icon'>[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface SidebarData {
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: {
    name: string
    logo: LucideIcon
    plan: string
  }[]
  navGroups: NavGroup[]
} 