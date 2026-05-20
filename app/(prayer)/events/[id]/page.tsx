"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { eventService, Event } from "@/services/v-2/prayer/event.service";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Users,
  Share2,
  Printer,
  MoreVertical,
  CalendarPlus,
  Bell,
  BellRing,
  BookOpen,
  Presentation,
  Users2,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { showToast } from "@/lib/toast";
import Image from "next/image";

export default function ShowEventPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isNotified, setIsNotified] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!params.id) return;
    
    try {
      setIsLoading(true);
      const response = await eventService.getEvent(params.id as string);
      setEvent(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || '')}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleToggleNotify = () => {
    setIsNotified(!isNotified);
    if (!isNotified) {
      showToast.success(t('prayer.events.notifySuccess'));
    } else {
      showToast.success(t('prayer.events.unnotifySuccess'));
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error?.message || t('common.error')}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          {t('common.back')}
        </Button>
      </Card>
    );
  }

  const StatusIcon = getStatusIcon(event.status);
  const TypeIcon = getTypeIcon(event.type);

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-4",
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className={cn(
            language === 'ar' && "rotate-180"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {event.status === 'upcoming' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleNotify}
              className={cn(
                "flex items-center gap-2",
                isNotified && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {isNotified ? (
                <>
                  <BellRing className="h-4 w-4" />
                  {t('prayer.events.notificationEnabled')}
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  {t('prayer.events.notifyMe')}
                </>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('prayer.events.share')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t('prayer.events.print')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToCalendar}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                {t('prayer.events.calendar')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Event Image */}
        {event.image && (
          <Card className="overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        )}

        {/* Event Details */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Title and Status */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={cn(
                  getStatusColor(event.status),
                  "flex items-center gap-1",
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {t(`prayer.events.status.${event.status}`)}
                </Badge>
                <Badge variant="secondary" className={cn(
                  getTypeColor(event.type),
                  "flex items-center gap-1",
                )}>
                  <TypeIcon className="h-3 w-3" />
                  {t(`prayer.events.type.${event.type}`)}
                </Badge>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('prayer.events.startDate')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), 'PPP', {
                      locale: language === 'ar' ? arSA : enUS
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('prayer.events.time')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), 'p', {
                      locale: language === 'ar' ? arSA : enUS
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Location and Attendees */}
            <div className="grid gap-4 grid-cols-2">
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('prayer.events.location')}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}
              {event.max_attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('prayer.events.attendees')}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.current_attendees}/{event.max_attendees}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-medium">{t('prayer.events.description')}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">{t('prayer.events.speakers')}</h3>
                <div className="grid gap-4">
                  {event.speakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <Avatar className="h-12 w-12 border-2 border-muted-foreground/10">
                        <AvatarImage src={speaker.image} alt={speaker.name} />
                        <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{speaker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {speaker.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 