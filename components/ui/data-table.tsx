"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/datatable/pagination"
import { DataTableToolbar } from "@/components/datatable/toolbar"
import { useLanguage } from "@/providers/language-provider"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total?: number
  pageSize?: number
  currentPage?: number
  createUrl?: string
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  isLoading?: boolean
  showColumnVisibility?: boolean
  defaultVisibleColumns?: string[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  createButtonLabel?: string
  onCreateClick?: () => void
}

export type Column<T> = ColumnDef<T>

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  pageSize = 10,
  currentPage = 1,
  createUrl,
  searchPlaceholder,
  onSearch,
  onPageChange,
  onPageSizeChange,
  isLoading,
  showColumnVisibility = false,
  defaultVisibleColumns = [],
  onSort,
  createButtonLabel,
  onCreateClick,
}: DataTableProps<TData, TValue>) {
  const { t } = useLanguage()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      if (newSorting.length > 0 && onSort) {
        onSort(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  React.useEffect(() => {
    if (defaultVisibleColumns.length > 0) {
      const initialVisibility = columns.reduce((acc, column) => {
        const columnId = typeof column.id === 'string' ? column.id : ''
        if (column.enableHiding !== false) {
          acc[columnId] = defaultVisibleColumns.includes(columnId)
        } else {
          acc[columnId] = true
        }
        return acc
      }, {} as VisibilityState)
      setColumnVisibility(initialVisibility)
    }
  }, [columns, defaultVisibleColumns])

  return (
    <div className="space-y-4 dark:bg-dark-foreground dark:text-dark-background">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        showColumnVisibility={showColumnVisibility}
        createUrl={createUrl}
        createButtonLabel={createButtonLabel}
        onCreateClick={onCreateClick}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('common.dataTable.loading')}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('common.dataTable.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
} 