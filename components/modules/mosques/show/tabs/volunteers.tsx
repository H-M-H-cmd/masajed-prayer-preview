"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { DataTable } from "@/components/ui/data-table";
import { useApi } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getColumns } from "@/components/modules/volunteers/columns";
import { VolunteerOpportunity, VolunteerPaginatedResponse } from "@/types/volunteer";
import { volunteerService } from "@/services/volunteer.service";
import { ApiResponse } from "@/types/api";
import { VolunteerDrawer } from "@/components/modules/volunteers/volunteer-drawer";
import { VolunteerShow } from "@/components/modules/volunteers/show";
import { VolunteerFormValues } from "@/components/modules/volunteers/schema";
import { useLayoutContext } from "@/providers/layout-provider";


interface TableState {
  isInitialized: boolean;
  search: string;
  page: number;
  perPage: number;
  sort: {
    key: keyof VolunteerOpportunity;
    direction: "asc" | "desc";
  } | null;
}

export function VolunteersTab({ mosqueId }: { mosqueId: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { volunteerDrawerOpen, setVolunteerDrawerOpen, selectedVolunteer, setSelectedVolunteer } = useLayoutContext();
  const [selectedVolunteerId, setSelectedVolunteerId] = React.useState<string | null>(null);


  const [state, setState] = React.useState<TableState>({
    isInitialized: false,
    search: "",
    page: 1,
    perPage: 10,
    sort: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);
  const { execute: fetchVolunteers, data: volunteersData, isLoading } = useApi<ApiResponse<VolunteerPaginatedResponse>>(
    () => volunteerService.getVolunteers({
      search: debouncedSearch,
      page: state.page,
      perPage: state.perPage,
      mosque_id: mosqueId,
      ...(state.sort && { sort_by: state.sort.key, sort_direction: state.sort.direction })
    })
  );
  console.log("fetchVolunteers", volunteersData)

  const { execute: updateVolunteer, isLoading: isUpdating } = useApi<
    ApiResponse<VolunteerOpportunity>,
    VolunteerFormValues
  >(
    async (data) => {
      if (!selectedVolunteer) throw new Error("No volunteer selected");
      return await volunteerService.updateVolunteer(selectedVolunteer.id, {
        ...data,
        mosque_id: mosqueId,
      });
    },
    {
      onSuccess: () => {
        toast({
          title: t("volunteers.updateSuccess"),
          description: t("common.success"),
        });
        setVolunteerDrawerOpen(false);
        setSelectedVolunteer(null);
        void fetchVolunteers();
      },
      onError: (error) => {
        toast({
          title: t("volunteers.updateError"),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleSubmit = async (data: VolunteerFormValues) => {
    await updateVolunteer(data);
  };

  const { execute: deleteVolunteer } = useApi<ApiResponse<void>, string>(
    async (id) => volunteerService.deleteVolunteer(id),
    {
      onSuccess: () => {
        toast({
          title: t("volunteers.deleteSuccess"),
          description: t("common.success"),
        });
        void fetchVolunteers();
      },
      onError: (error) => {
        toast({
          title: t("volunteers.deleteError"),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  React.useEffect(() => {
    if (!state.isInitialized) {
      setState((prev) => ({ ...prev, isInitialized: true }));
      return;
    }

    void fetchVolunteers();
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

  const handleDelete = React.useCallback(
    async (id: string) => {
      await deleteVolunteer(id);
    },
    [deleteVolunteer]
  );

  const handleSort = React.useCallback((key: string, direction: "asc" | "desc") => {
    setState((prev) => ({
      ...prev,
      sort: { key: key as keyof VolunteerOpportunity, direction },
      page: 1,
    }));
  }, []);

  const handleView = React.useCallback((volunteer: VolunteerOpportunity) => {
    setSelectedVolunteerId(volunteer.id);
  }, []);

  const handleEdit = React.useCallback((volunteer: VolunteerOpportunity) => {
    setSelectedVolunteerId(null);
    setSelectedVolunteer(volunteer);
    setVolunteerDrawerOpen(true);
  }, [setVolunteerDrawerOpen, setSelectedVolunteerId, setSelectedVolunteer]);

  const handleBack = React.useCallback(() => {
    setSelectedVolunteerId(null);
    setSelectedVolunteer(null);
  }, []);

  const columns = React.useMemo(
    () =>
      getColumns({
        t,
        onView: handleView,
        onDelete: handleDelete,
        onEdit: handleEdit,
      }),
    [t, handleView, handleDelete, handleEdit]
  );

  if (selectedVolunteerId) {
    return <VolunteerShow volunteerId={selectedVolunteerId} onBack={handleBack} />;
  }

  if (!state.isInitialized) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={volunteersData?.data?.data || []}
        columns={columns}
        total={volunteersData?.data?.meta?.total || 0}
        pageSize={state.perPage}
        currentPage={state.page}
        searchPlaceholder={t("volunteers.searchPlaceholder")}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        showColumnVisibility={true}
        defaultVisibleColumns={["title", "start_at", "end_at", "status", "actions"]}
        onSort={handleSort}
      />

          <VolunteerDrawer
          open={volunteerDrawerOpen}
          onOpenChange={(open) => {
            setVolunteerDrawerOpen(open);
            if (!open) {
            setSelectedVolunteer(null);
            }
          }}
          volunteer={selectedVolunteer || undefined}
          mode={selectedVolunteer ? 'edit' : 'create'}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          />
    </div>
  );
}