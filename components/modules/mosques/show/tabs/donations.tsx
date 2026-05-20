"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { DataTable } from "@/components/ui/data-table";
import { useApi } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { getColumns } from "@/components/modules/donations/columns";
import { Donation, DonationRow, DonationPaginatedResponse } from "@/types/donation";
import { donationService } from "@/services/donation.service";
import { ApiResponse } from "@/types/api";
import { DonationShow } from "@/components/modules/donations/show";
import { useLayoutContext } from "@/providers/layout-provider";

interface DonationsTabProps {
  mosqueId: string;
}

interface TableState {
  isInitialized: boolean;
  search: string;
  page: number;
  perPage: number;
  sort: {
    key: keyof Donation;
    direction: "asc" | "desc";
  } | null;
}

export function DonationsTab({ mosqueId }: DonationsTabProps) {
  const { t } = useLanguage();
  const { selectedDonation, setSelectedDonation } = useLayoutContext();
  console.log(mosqueId, "mosqueId", selectedDonation, "selectedDonation");
  const [selectedDonationId, setSelectedDonationId] = React.useState<string | null>(null);

  const [state, setState] = React.useState<TableState>({
    isInitialized: false,
    search: "",
    page: 1,
    perPage: 10,
    sort: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);
  const { execute: fetchDonations, data: donationsData, isLoading } = useApi<ApiResponse<DonationPaginatedResponse>>(
    () => donationService.getDonations({
      search: debouncedSearch,
      // page: state.page,
      // perPage: state.perPage,
      // mosque_id: mosqueId,
      ...(state.sort && { sort_by: state.sort.key, sort_direction: state.sort.direction }),
    })
  );

  React.useEffect(() => {
    if (!state.isInitialized) {
      setState((prev) => ({ ...prev, isInitialized: true }));
      return;
    }
    void fetchDonations();
  }, [state.isInitialized, debouncedSearch, state.page, state.perPage, state.sort]);

  const handleSearch = React.useCallback((value: string) => {
    setState((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  const handlePageChange = React.useCallback((newPage: number) => {
    setState((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = React.useCallback((newSize: number) => {
    setState((prev) => ({ ...prev, perPage: newSize, page: 1 }));
  }, []);

  const handleSort = React.useCallback((key: string, direction: "asc" | "desc") => {
    setState((prev) => ({ ...prev, sort: { key: key as keyof Donation, direction }, page: 1 }));
  }, []);

  const handleView = React.useCallback((donation: DonationRow) => {
    setSelectedDonationId(donation.id);
  }, []);

  const handleBack = React.useCallback(() => {

    setSelectedDonationId(null);
    setSelectedDonation(null);
  }, []);

  const columns = React.useMemo(() => getColumns({ t, onView: handleView }), [t, handleView ]);

  if (selectedDonationId) {
    return <DonationShow donationId={selectedDonationId} onBack={handleBack} />;
  }

  if (!state.isInitialized) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={donationsData?.data?.data || []}
        columns={columns}
        total={donationsData?.data?.meta?.total || 0}
        pageSize={state.perPage}
        currentPage={state.page}
        searchPlaceholder={t("donations.searchPlaceholder")}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        showColumnVisibility={true}
        defaultVisibleColumns={["title", "date", "status", "actions"]}
        onSort={handleSort}
      />
    </div>
    );
  }
