import { useOS } from '@/hooks/use-os'
import { cn } from '@/lib/utils'

interface CommandKeyProps {
  commandKey: string
  className?: string
}

export function CommandKey({ commandKey, className }: CommandKeyProps) {
  const { modifierKey } = useOS()

  return (
    <kbd className={cn(
      'pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-100 md:flex',
      className
    )}>
      {modifierKey}+{commandKey.toUpperCase()}
    </kbd>
  )
} 