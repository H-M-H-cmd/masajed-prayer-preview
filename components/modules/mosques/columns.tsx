"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { types } from "./data"
import { MosqueRow } from "./schema"
import { DataTableColumnHeader } from "@/components/datatable/column-header"
import { DataTableRowActions } from "@/components/datatable/row-actions"
import { Eye, Pencil, Trash, Building2 } from "lucide-react"
import Image from "next/image"

interface GetColumnsProps {
  t: (key: string) => string
  onView: (mosque: MosqueRow) => void
  onDelete: (id: string) => Promise<void>
}

const ORGANIZATION_ICONS = {
  moia: "/assets/Moia.png",
  awqaf: "/assets/Awqaf.png",
  private: null // No icon for private
} as const

export function getColumns({ t, onView, onDelete }: GetColumnsProps): ColumnDef<MosqueRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
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
      enableSorting: true,
      enableHiding: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('mosques.name')}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("name")}
            </span>
          </div>
        )
      },
    },
    {
      id: "type",
      accessorKey: "type",
      enableSorting: true,
      enableHiding: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('mosques.type')}
        />
      ),
      cell: ({ row }) => {
        const type = types.find(
          (type) => type.value === row.getValue("type")
        )

        if (!type) {
          return null
        }

        return (
          <div className="flex w-[100px] items-center">
            {type.icon && (
              <type.icon className="me-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{t(`mosques.form.types.${type.value}`)}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "related_to",
      accessorKey: "related_to",
      enableSorting: true,
      enableHiding: true,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('mosques.relatedTo')}
        />
      ),
      cell: ({ row }) => {
        const relatedToValue = row.getValue("related_to") as string
        const iconPath = ORGANIZATION_ICONS[relatedToValue as keyof typeof ORGANIZATION_ICONS]

        return (
          <div className="flex items-center gap-2">
            {iconPath ? (
              <div className="relative w-4 h-4">
                <Image
                  src={iconPath}
                  alt={relatedToValue}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span className="uppercase">
              {t(`mosques.form.organizations.${relatedToValue}`)}
            </span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
              href: (mosque) => `/dashboard/mosques/${mosque.id}/edit`,
            },
            {
              label: t('common.delete'),
              icon: Trash,
              onClick: () => onDelete(row.original.id),
              variant: 'destructive',
            },
          ]}
          subMenus={[
            {
              label: t('mosques.type'),
              icon: Building2,
              options: types.map(type => ({
                label: t(`mosques.form.types.${type.value}`),
                value: type.value,
                icon: type.icon,
              })),
              value: (mosque) => mosque.type,
              onChange: (value, mosque) => {
                // Handle type change
                console.log('Type changed:', value, mosque)
              },
            },
          ]}
        />
      ),
    },
  ]
}