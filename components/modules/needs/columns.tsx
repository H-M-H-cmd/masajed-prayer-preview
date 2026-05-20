"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Need, NeedRow } from "@/types/need";
import { DataTableColumnHeader } from "@/components/datatable/column-header";
import { DataTableRowActions } from "@/components/datatable/row-actions";
import { Eye, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaudiRiyal } from "@/components/ui/saudi-riyal";

interface GetColumnsProps {
	t: (key: string) => string;
	onView: (need: NeedRow) => void;
	onDelete: (id: string) => Promise<void>;
}

const statusVariants: Record<Need['status'], "default" | "destructive" | "outline" | "secondary"> = {
	new: "default",
	progress: "secondary",
	completed: "outline",
	cancelled: "destructive",
};

export function getColumns({ t, onView, onDelete }: GetColumnsProps): ColumnDef<NeedRow>[] {
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
			header: ({ column }) => <DataTableColumnHeader column={column} title={t("needs.title")} />,
			cell: ({ row }) => {
				return (
					<div className="flex space-x-2">
						<span className="max-w-[500px] truncate font-medium">
							{row.getValue("title")}
						</span>
					</div>
				);
			},
		},
		{
			id: "date",
			accessorKey: "date",
			header: ({ column }) => <DataTableColumnHeader column={column} title={t("needs.date")} />,
			cell: ({ row }) => {
				return (
					<div className="flex space-x-2">
						<span className="max-w-[500px] truncate">
							{row.getValue("date")}
						</span>
					</div>
				);
			},
		},
		{
			id: "contractor",
			accessorKey: "contractor",
			header: ({ column }) => <DataTableColumnHeader column={column} title={t("needs.contractor")} />,
			cell: ({ row }) => {
				const contractor = row.getValue("contractor") as { name: string };
				return (
					<div className="flex space-x-2">
						<span className="max-w-[500px] truncate">
							{contractor.name}
						</span>
					</div>
				);
			},
		},
		{
			id: "cost",
			accessorKey: "cost",
			header: ({ column }) => <DataTableColumnHeader column={column} title={t("needs.cost")} />,
			cell: ({ row }) => {
				return (
					<div className="flex space-x-2">
						<span className="max-w-[500px] truncate flex items-center gap-1">
							{row.getValue("cost")} 				
							<SaudiRiyal className="h-4 w-4" />
						</span>
					</div>
				);
			},
		},
		{
			id: "status",
			accessorKey: "status",
			header: ({ column }) => <DataTableColumnHeader column={column} title={t("needs.status")} />,
			cell: ({ row }) => {
				const status = row.getValue("status") as keyof typeof statusVariants;
				return (
					<Badge variant={statusVariants[status]}>
						{t(`needs.statuses.${status}`)}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
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
							label: t("common.view"),
							icon: Eye,
							onClick: () => onView(row.original),
						},
						{
							label: t("common.delete"),
							icon: Trash,
							onClick: () => onDelete(row.original.id),
							variant: "destructive",
						},
					]}
				/>
			),
		},
	];
}