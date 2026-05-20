"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { DataTable } from "@/components/ui/data-table";
import { useApi } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getColumns } from "@/components/modules/events/columns";
import { Event, EventRow, EventPaginatedResponse } from "@/types/event";
import { eventService } from "@/services/event.service";
import { ApiResponse } from "@/types/api";
import { EventShow } from "@/components/modules/events/show";
import { useLayoutContext } from "@/providers/layout-provider";

interface EventsTabProps {
  mosqueId: string;
}


interface TableState {
  isInitialized: boolean;
  search: string;
  page: number;
  perPage: number;
  sort: {
    key: keyof Event;
    direction: "asc" | "desc";
  } | null;
}

export function EventsTab({ mosqueId }: EventsTabProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { setEventDrawerOpen, setSelectedEvent } = useLayoutContext();
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);

  const [state, setState] = React.useState<TableState>({
    isInitialized: false,
    search: "",
    page: 1,
    perPage: 10,
    sort: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  const { execute: fetchEvents, data: eventsData, isLoading } = useApi<ApiResponse<EventPaginatedResponse>>(
    () => eventService.getEvents({
      search: debouncedSearch,
      page: state.page,
      per_page: state.perPage,
      mosque_id: parseInt(mosqueId),
      ...(state.sort && { sort_by: state.sort.key, sort_direction: state.sort.direction })
    })
  );
  console.log('fetchEvents', eventsData)

  const { execute: deleteEvent } = useApi<ApiResponse<void>, string>(
    async (id) => eventService.deleteEvent(id),
    {
      onSuccess: () => {
        toast({
          title: t("events.deleteSuccess"),
          description: t("common.success"),
        });
        fetchEvents();
      },
      onError: (error) => {
        toast({
          title: t("events.deleteError"),
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

    void fetchEvents();
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
      await deleteEvent(id);
    },
    [deleteEvent]
  );

  const handleSort = React.useCallback((key: string, direction: "asc" | "desc") => {
    setState((prev) => ({
      ...prev,
      sort: { key: key as keyof Event, direction },
      page: 1,
    }));
  }, []);

  const handleView = React.useCallback((event: EventRow) => {
    setSelectedEventId(event.id);
  }, []);

  const handleBack = React.useCallback(() => {
    setSelectedEventId(null);
  }, []);

  const handleEdit = React.useCallback((event: EventRow) => {
    setSelectedEventId(null);
    const eventData = eventsData?.data?.data.find(e => e.id === event.id);
    if (eventData) {
      setSelectedEvent(eventData);
      setEventDrawerOpen(true);
    }
  }, [eventsData?.data?.data, setSelectedEvent, setEventDrawerOpen]);

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

  console.log(selectedEventId)
  if (selectedEventId) {
    return (
      <EventShow 
        eventId={selectedEventId} 
        onBack={handleBack}
        onEdit={(event) => {
          setSelectedEventId(null);
          setSelectedEvent(event);
          setEventDrawerOpen(true);
        }}
      />
    );
  }

  if (!state.isInitialized) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={eventsData?.data?.data || []}
        columns={columns}
        total={eventsData?.data?.meta?.total || 0}
        pageSize={state.perPage}
        currentPage={state.page}
        searchPlaceholder={t("events.searchPlaceholder")}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        showColumnVisibility={true}
        defaultVisibleColumns={["title", "start_at", "end_at", "status", "actions"]}
        onSort={handleSort}
      />
    </div>
  );
} 