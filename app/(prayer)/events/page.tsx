"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { eventService, Event } from "@/services/v-2/prayer/event.service";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Users,
  MapPin,
  BookOpen,
  Presentation,
  Users2,
  GraduationCap,
  MoreHorizontal,
  Bell,
  BellOff,
  BellRing,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showToast } from "@/lib/toast";

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage] = useState(1);
  const [notifyAllEvents, setNotifyAllEvents] = useState(false);
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents({
        page: currentPage,
        per_page: 10
      });
      setEvents(response.data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case "upcoming":
        return Clock;
      case "ongoing":
        return AlertCircle;
      case "completed":
        return CheckCircle2;
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-500";
      case "ongoing":
        return "bg-orange-500/10 text-orange-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getTypeIcon = (type: Event['type']) => {
    switch (type) {
      case "lecture":
        return Presentation;
      case "quran":
        return BookOpen;
      case "workshop":
        return GraduationCap;
      case "gathering":
        return Users2;
      default:
        return MoreHorizontal;
    }
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case "lecture":
        return "bg-purple-500/10 text-purple-500";
      case "quran":
        return "bg-green-500/10 text-green-500";
      case "workshop":
        return "bg-blue-500/10 text-blue-500";
      case "gathering":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const handleToggleNotifyAll = () => {
    setNotifyAllEvents(!notifyAllEvents);
    if (!notifyAllEvents) {
      // Subscribe to all upcoming events
      const upcomingEventIds = events
        .filter(event => event.status === 'upcoming')
        .map(event => event.id);
      setNotifiedEvents(new Set(upcomingEventIds));
      showToast.success(t('prayer.events.notifyAllSuccess'));
    } else {
      // Unsubscribe from all events
      setNotifiedEvents(new Set());
      showToast.success(t('prayer.events.unnotifyAllSuccess'));
    }
  };

  const handleToggleNotify = (eventId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent card click navigation
    event.stopPropagation(); // Prevent event bubbling
    
    const newNotifiedEvents = new Set(notifiedEvents);
    if (notifiedEvents.has(eventId)) {
      newNotifiedEvents.delete(eventId);
      showToast.success(t('prayer.events.unnotifySuccess'));
    } else {
      newNotifiedEvents.add(eventId);
      showToast.success(t('prayer.events.notifySuccess'));
    }
    setNotifiedEvents(newNotifiedEvents);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className={cn(
          "flex items-center justify-between",
        )}>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Events List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          {t('common.retry')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
      )}>
        <h2 className="text-lg font-semibold">
          {t('prayer.events.title')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleNotifyAll}
          className={cn(
            "flex items-center gap-2",
            notifyAllEvents && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {notifyAllEvents ? (
            <>
              <BellRing className="h-4 w-4" />
              {t('prayer.events.notifyAll')}
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              {t('prayer.events.unnotifyAll')}
            </>
          )}
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Calendar className="h-8 w-8" />
              <p>{t('prayer.events.noEvents')}</p>
            </div>
          </Card>
        ) : (
          events.map((event) => {
            const StatusIcon = getStatusIcon(event.status);
            const TypeIcon = getTypeIcon(event.type);
            const isNotified = notifiedEvents.has(event.id);
            
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className={cn(
                    "p-4 transition-colors hover:bg-muted/50 mb-4",
                    "cursor-pointer group relative"
                  )}
                >
                  {/* Notification Button - Absolute positioned */}
                  {event.status === 'upcoming' && (
                    <div className={cn(
                      "absolute bottom-4 right-4",
                      language === 'ar' && "left-4 right-auto"
                    )}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleNotify(event.id, e)}
                        className={cn(
                          "h-8 w-8",
                          isNotified && "text-primary"
                        )}
                      >
                        {isNotified ? (
                          <BellRing className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Event Header - Adjust padding for notification button */}
                    <div className={cn(
                      "flex items-start gap-4"
                    )}>
                      <div className="space-y-1 flex-1">
                        <h3 className="font-medium line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        "group-hover:translate-x-0.5",
                        language === 'ar' && "rotate-180 group-hover:-translate-x-0.5"
                      )} />
                    </div>

                    {/* Event Meta */}
                    <div className={cn(
                      "flex flex-wrap items-center gap-2",
                    )}>
                      {/* Status Badge */}
                      <Badge variant="secondary" className={cn(
                        getStatusColor(event.status),
                        "flex items-center gap-1",
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {t(`prayer.events.status.${event.status}`)}
                      </Badge>

                      {/* Type Badge */}
                      <Badge variant="secondary" className={cn(
                        getTypeColor(event.type),
                        "flex items-center gap-1",
                      )}>
                        <TypeIcon className="h-3 w-3" />
                        {t(`prayer.events.type.${event.type}`)}
                      </Badge>

                      {/* Date Badge */}
                      <Badge variant="outline" className={cn(
                        "flex items-center gap-1",
                      )}>
                        <Calendar className="h-3 w-3" />
                        {new Date(event.start_date).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US'
                        )}
                      </Badge>
                    </div>

                    {/* Event Details */}
                    <div className={cn(
                      "grid grid-cols-2 gap-2 text-sm text-muted-foreground text-start"
                    )}>
                      {/* Location */}
                      {event.location && (
                        <div className={cn(
                          "flex items-center gap-1",
                        )}>
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {/* Attendees */}
                      {event.max_attendees && (
                        <div className={cn(
                          "flex items-center gap-1",
                        )}>
                          <Users className="h-3 w-3" />
                          <span>
                            {event.current_attendees}/{event.max_attendees}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Speakers */}
                    {event.speakers.length > 0 && (
                      <div className="flex items-center gap-2" 
                      
                      >
                        <div className="flex -space-x-2">
                          {event.speakers.map((speaker) => (
                            <Avatar
                              key={speaker.id}
                              className="border-2 border-background"
                            >
                              <AvatarImage src={speaker.image} alt={speaker.name} />
                              <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {event.speakers.map(s => s.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
} 