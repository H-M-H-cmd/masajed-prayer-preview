"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { EventRow } from "../events/schema"
import { DataTableColumnHeader } from "@/components/datatable/column-header"
import { DataTableRowActions } from "@/components/datatable/row-actions"
import { Pencil, Trash, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { statuses } from "./data"
import { EventStatus } from "@/types/event"

interface GetColumnsProps {
  t: (key: string) => string
  onView: (member: EventRow) => void
  onDelete: (id: string) => Promise<void>
  onEdit: (member: EventRow) => void
}

const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "yyyy-M-dd")
  } catch {
    return "-"
  }
}

export function getColumns({ t, onView, onDelete, onEdit }: GetColumnsProps): ColumnDef<EventRow>[] {
  
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "title",
      accessorKey: "title",
      enableSorting: true,
      enableHiding: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('events.title')} />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      id: "start_at",
      accessorKey: "start_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('events.startDate')} />
      ),
      cell: ({ row }) => {
        const startAt = row.getValue("start_at") as string
        return <div className="text-start" dir="ltr">{formatDate(startAt)}</div>
      },
    },
    {
      id: "end_at",
      accessorKey: "end_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('events.endDate')} />
      ),
      cell: ({ row }) => {
        const endAt = row.getValue("end_at") as string
        return <div className="text-start" dir="ltr">{formatDate(endAt)}</div>
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('events.statusTitle')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as EventStatus;
        
        if (!status) return null;
        
        const statusConfig = statuses.find(s => s.value === status);
        if (!statusConfig) {
          return <div className="text-start" dir="ltr">{String(status)}</div>;
        }
        
        const Icon = statusConfig.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Badge variant="secondary">
              { String(statusConfig.label_ar)}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: t('common.view'),
              icon: Eye,
              onClick: () => onView(row.original),
            },
            {
              label: t('common.edit'),
              icon: Pencil,
              onClick: () => onEdit(row.original),
            },
            {
              label: t('common.delete'),
              icon: Trash,
              onClick: () => onDelete(row.original.id),
              variant: 'destructive',
            },
          ]}
        />
      ),
    },
  ]
} 