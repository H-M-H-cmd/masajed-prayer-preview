"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { groups } from "./data"
import { MemberRow } from "./schema"
import { DataTableColumnHeader } from "@/components/datatable/column-header"
import { DataTableRowActions } from "@/components/datatable/row-actions"
import { Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GetColumnsProps {
  t: (key: string) => string
  onView: (member: MemberRow) => void
  onDelete: (id: string) => Promise<void>
  onEdit: (member: MemberRow) => void
}

export function getColumns({ t, onDelete, onEdit }: GetColumnsProps): ColumnDef<MemberRow>[] {
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
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('members.name')} />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('members.phone')} />
      ),
      cell: ({ row }) => <div className="text-start" dir="ltr">{row.getValue("phone")}</div>,
    },
    {
      id: "group",
      accessorKey: "group",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('members.group')} />
      ),
      cell: ({ row }) => {
        const group = groups.find((g) => g.value === row.getValue("group"))
        const Icon = group?.icon

        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-capitalize">{row.getValue("group")}</span>
          </div>
        )
      },
    },
    {
      id: "is_active",
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('members.status')} />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active")
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {t(`members.memberStatus.${isActive ? 'active' : 'inactive'}`)}
          </Badge>
        )
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