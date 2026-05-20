"use client"

import { Row } from "@tanstack/react-table"
import { LucideIcon, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Action<TData> {
  label: string
  icon: LucideIcon
  onClick?: (data: TData) => void
  href?: (data: TData) => string
  variant?: 'default' | 'destructive'
}

export interface SubMenu<TData> {
  label: string
  icon: LucideIcon
  options: {
    label: string
    value: string
    icon?: LucideIcon
  }[]
  value: (data: TData) => string
  onChange: (value: string, data: TData) => void
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  actions?: Action<TData>[]
  subMenus?: SubMenu<TData>[]
}

export function DataTableRowActions<TData>({
  row,
  actions = [],
  subMenus = [],
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action) => {
          const MenuItem = (
            <DropdownMenuItem
              key={action.label}
              onClick={() => action.onClick?.(row.original)}
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          )
          
          return action.href ? (
            <a key={action.label} href={action.href(row.original)}>
              {MenuItem}
            </a>
          ) : MenuItem
        })}
        
        {actions.length > 0 && subMenus.length > 0 && (
          <DropdownMenuSeparator />
        )}
        
        {subMenus.map((subMenu) => (
          <DropdownMenuSub key={subMenu.label}>
            <DropdownMenuSubTrigger>
              <subMenu.icon className="mr-2 h-4 w-4" />
              <span>{subMenu.label}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup 
                value={subMenu.value(row.original)}
                onValueChange={(value) => subMenu.onChange(value, row.original)}
              >
                {subMenu.options.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4" />
                    )}
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}