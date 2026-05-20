import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Donation } from "@/types/donation";

interface GetColumnsProps {
  t: (key: string) => string;
  onView: (donation: Donation) => void;
}

export const getColumns = ({ t, onView }: GetColumnsProps): ColumnDef<Donation>[] => [
  {
    accessorKey: "donor.name",
    header: t("donations.columns.donor"),
  },
  {
    accessorKey: "amount",
    header: t("donations.columns.amount"),
    // cell: ({ row }) => (
    //   <Badge variant="outline" className="font-mono">
    //     {row.original.amount} {t("common.currency")}
    //   </Badge>
    // ),
  },
  {
    accessorKey: "title",
    header: t("donations.columns.title"),
  },
  // {
  //   accessorKey: "status",
  //   header: t("donations.columns.status"),
  //   cell: ({ row }) => (
  //     <Badge variant={statusVariants[row.original.status]}>
  //       {t(`donations.statuses.${row.original.status}`)}
  //     </Badge>
  //   ),
  // },
  {
    accessorKey: "date",
    header: t("donations.columns.date"),
  },
  {
    accessorKey: "paymentMethod",
    header: t("donations.columns.paymentMethod"),
    cell: ({ row }) => (
      <span>{t(`donations.paymentMethods.${row.original.paymentMethod}`)}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
