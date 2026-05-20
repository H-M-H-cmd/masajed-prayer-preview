"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { DataTable } from "@/components/ui/data-table";
import { useApi } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getColumns } from "@/components/modules/needs/columns";
import { Need, NeedRow, NeedPaginatedResponse, CreateNeedData } from "@/types/need";
import { needService } from "@/services/need.service";
import { ApiResponse } from "@/types/api";
import { NeedDrawer } from "@/components/modules/needs/need-drawer";
import { NeedShow } from "@/components/modules/needs/show";
import { useLayoutContext } from "@/providers/layout-provider";

interface NeedsTabProps {
  mosqueId: string;
}

interface TableState {
  isInitialized: boolean;
  search: string;
  page: number;
  perPage: number;
  sort: {
    key: keyof Need;
    direction: "asc" | "desc";
  } | null;
}

export function NeedsTab({ mosqueId }: NeedsTabProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { needDrawerOpen, setNeedDrawerOpen, selectedNeed, setSelectedNeed } = useLayoutContext();
  const [selectedNeedId, setSelectedNeedId] = React.useState<string | null>(null);

  const [state, setState] = React.useState<TableState>({
    isInitialized: false,
    search: "",
    page: 1,
    perPage: 10,
    sort: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);
  const { execute: fetchNeeds, data: needsData, isLoading } = useApi<ApiResponse<NeedPaginatedResponse>>(
    () => needService.getNeeds({
      search: debouncedSearch,
      page: state.page,
      perPage: state.perPage,
      mosque_id: mosqueId,
      ...(state.sort && { sort_by: state.sort.key, sort_direction: state.sort.direction }),
    })
  );

  const { execute: updateNeed, isLoading: isUpdating } = useApi<ApiResponse<Need>, CreateNeedData>(
    async (data) => {
      if (!selectedNeed) throw new Error("No need selected");
      return await needService.updateNeed(selectedNeed.id, data);
    },
    {
      onSuccess: () => {
        toast({
          title: t("needs.updateSuccess"),
          description: t("common.success"),
        });
        setNeedDrawerOpen(false);
        setSelectedNeed(null);
        void fetchNeeds();
      },
      onError: (error) => {
        toast({
          title: t("needs.updateError"),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleSubmit = async (data: CreateNeedData) => {
    await updateNeed(data);
  };

  const { execute: deleteNeed } = useApi<ApiResponse<void>, string>(
    async (id) => needService.deleteNeed(id),
    {
      onSuccess: () => {
        toast({
          title: t("needs.deleteSuccess"),
          description: t("common.success"),
        });
        void fetchNeeds();
      },
      onError: (error) => {
        toast({
          title: t("needs.deleteError"),
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
    void fetchNeeds();
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

  const handleDelete = React.useCallback(async (id: string) => {
    await deleteNeed(id);
  }, [deleteNeed]);

  const handleSort = React.useCallback((key: string, direction: "asc" | "desc") => {
    setState((prev) => ({ ...prev, sort: { key: key as keyof Need, direction }, page: 1 }));
  }, []);

  const handleView = React.useCallback((need: NeedRow) => {
    setSelectedNeedId(need.id);
  }, []);

  const handleBack = React.useCallback(() => {

    setSelectedNeedId(null);
    setSelectedNeed(null);
  }, []);

  const columns = React.useMemo(() => getColumns({ t, onView: handleView, onDelete: handleDelete }), [t, handleView, handleDelete]);

  if (selectedNeedId) {
    return <NeedShow needId={selectedNeedId} onBack={handleBack} />;
  }

  if (!state.isInitialized) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={needsData?.data?.data || []}
        columns={columns}
        total={needsData?.data?.meta?.total || 0}
        pageSize={state.perPage}
        currentPage={state.page}
        searchPlaceholder={t("needs.searchPlaceholder")}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        showColumnVisibility={true}
        defaultVisibleColumns={["title", "date", "status", "actions"]}
        onSort={handleSort}
      />
      <NeedDrawer open={needDrawerOpen} onOpenChange={setNeedDrawerOpen} onSubmit={handleSubmit} isLoading={isUpdating} />
    </div>
    );
  }
