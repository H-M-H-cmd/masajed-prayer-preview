import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "@/components/datatable/row-actions";
import { Action } from "@/components/datatable/row-actions";
import { VolunteerOpportunity } from "@/types/volunteer";
import { Eye, Pencil, Trash } from "lucide-react";

interface GetColumnsProps {
  t: (key: string) => string;
  onView?: (volunteer: VolunteerOpportunity) => void;
  onEdit?: (volunteer: VolunteerOpportunity) => void;
  onDelete?: (id: string) => void;
}

export const getColumns = ({
  t,
  onView,
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<VolunteerOpportunity>[] => [
  {
    accessorKey: "title",
    header: t("volunteers.columns.title"),
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: t("volunteers.columns.type"),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {t(`volunteers.types.${row.getValue("type")}`)}
      </div>
    ),
  },
  {
    accessorKey: "start_at",
    header: t("volunteers.columns.startAt"),
    cell: ({ row }) => {
      const date = row.getValue("start_at");
      if (!date) return "-";
      return format(new Date(date as string), "PPp");
    },
  },
  {
    accessorKey: "end_at",
    header: t("volunteers.columns.endAt"),
    cell: ({ row }) => {
      const date = row.getValue("end_at");
      if (!date) return "-";
      return format(new Date(date as string), "PPp");
    },
  },
  {
    accessorKey: "status",
    header: t("volunteers.columns.status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, "default" | "outline" | "secondary" | "destructive"> = {
        open: "default",
        closed: "secondary",
        cancelled: "destructive",
      };

      return (
        <Badge variant={variants[status] || "outline"}>
          {t(`volunteers.status.${status}`)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "capacity",
    header: t("volunteers.columns.capacity"),
    cell: ({ row }) => row.getValue("capacity"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const volunteer = row.original;
      const actions: Action<VolunteerOpportunity>[] = [];

      if (onView) {
        actions.push({
          label: t("common.view"),
          onClick: () => onView(volunteer),
          icon: Eye,
        });
      }

      if (onEdit) {
        actions.push({
          label: t("common.edit"),
          onClick: () => onEdit(volunteer),
          icon: Pencil,
        });
      }

      if (onDelete) {
        actions.push({
          label: t("common.delete"),
          onClick: () => onDelete(volunteer.id),
          icon: Trash,
          variant: "destructive",
        });
      }

      return <DataTableRowActions<VolunteerOpportunity> actions={actions} row={row} />;
    },
  },
];
