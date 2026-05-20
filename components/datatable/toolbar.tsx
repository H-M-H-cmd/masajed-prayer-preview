"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./column-toggle"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/providers/language-provider"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  showColumnVisibility?: boolean
  createUrl?: string
  createButtonLabel?: string
  onCreateClick?: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  onSearch,
  showColumnVisibility = false,
  createUrl,
  createButtonLabel,
  onCreateClick,
}: DataTableToolbarProps<TData>) {
  const router = useRouter()
  const { t } = useLanguage()
  const isFiltered = table.getState().columnFilters.length > 0

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick()
    } else if (createUrl) {
      router.push(createUrl)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder || t('common.dataTable.search')}
          onChange={(event) => onSearch?.(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <div className="flex items-center gap-2">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('common.dataTable.reset')}
            <X className="h-4 w-4" />
          </Button>
        )}
        {showColumnVisibility && <DataTableViewOptions table={table} />}
        {(createUrl || onCreateClick) && (
          <Button
            onClick={handleCreate}
            className="h-8"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            {createButtonLabel || t('common.dataTable.create')}
          </Button>
        )}
      </div>
    </div>
  )
} 