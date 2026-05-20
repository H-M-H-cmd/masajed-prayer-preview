'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeftDashed,
  IconArrowRightDashed,
  IconDeviceLaptop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/providers/language-provider'
import { useTheme } from 'next-themes'
import { useCreateSidebarData } from './layout/data/sidebar-data'
import { DialogTitle } from '@/components/ui/dialog'
import { CommandKey } from '@/components/ui/command-key'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { t, direction } = useLanguage()
  const sidebarData = useCreateSidebarData(t)

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  // Add keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if meta (⌘) or ctrl key is pressed
      if (!(event.metaKey || event.ctrlKey)) return

      // Find all nav items with command keys
      const navItems = sidebarData.navGroups.flatMap(group => 
        group.items.flatMap(item => {
          if ('url' in item && 'commandKey' in item && item.commandKey) {
            return [{ url: item.url, key: item.commandKey }]
          }
          if ('items' in item && item.items) {
            return item.items
              .filter((subItem): subItem is { url: string; title: string; commandKey: string } => 
                'url' in subItem && 'commandKey' in subItem && !!subItem.commandKey
              )
              .map(subItem => ({ url: subItem.url, key: subItem.commandKey }))
          }
          return []
        })
      )

      // Find matching command key
      const matchingItem = navItems.find(item => 
        item.key.toLowerCase() === event.key.toLowerCase()
      )

      if (matchingItem) {
        event.preventDefault()
        router.push(matchingItem.url)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, sidebarData])

  return (
    <CommandDialog modal open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">{t('common.search')}</DialogTitle>
      <CommandInput placeholder={t('common.search')} />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>{t('common.noResults')}</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title} dir={direction} className='mt-2'>
              {group.items.map((navItem) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={navItem.url}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => router.push(navItem.url!))
                      }}
                    >
                      <div className='me-2 flex size-4 items-center justify-center'>
                        {direction === 'rtl' ? <IconArrowLeftDashed className='size-2 text-muted-foreground/80' /> : <IconArrowRightDashed className='size-2 text-muted-foreground/80' />}
                      </div>
                      {navItem.title}
                      {'commandKey' in navItem && typeof navItem.commandKey === 'string' && (
                        <span className='ms-auto'>{navItem.commandKey && <CommandKey commandKey={navItem.commandKey} />}</span>
                      )}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem) => (
                  <CommandItem
                    key={subItem.url}
                    value={subItem.title}
                    onSelect={() => {
                      runCommand(() => router.push(subItem.url!))
                    }}
                  >
                    <div className='me-2 flex size-4 items-center justify-center'>
                      <IconArrowRightDashed className='size-2 text-muted-foreground/80' />
                    </div>
                    {subItem.title}
                    {'commandKey' in subItem && typeof subItem.commandKey === 'string' && (
                      <CommandKey commandKey={subItem.commandKey} />
                    )}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t('common.toggleTheme')} dir={direction} className='mt-2'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <IconSun className='me-2' />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <IconMoon className='me-2' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <IconDeviceLaptop className='me-2' />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}