"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { prayerOrderService, PrayerOrder } from "@/services/v-2/prayer/issues.service";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  FileText,
  ListPlus,
  Share2,
  Printer,
  MoreVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Carousel } from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ShowIssuePage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [order, setOrder] = useState<PrayerOrder | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!params.id) return;
    
    try {
      setIsLoading(true);
      const response = await prayerOrderService.getOrder(params.id as string);
      setOrder(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: order?.title,
        text: order?.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error(error);
      // Handle share error or user cancellation
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusIcon = (status: PrayerOrder['status']) => {
    switch (status) {
      case "new":
        return Clock;
      case "pending":
        return AlertCircle;
      case "inProgress":
        return Clock;
      case "completed":
        return CheckCircle2;
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: PrayerOrder['status']) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "inProgress":
        return "bg-orange-500/10 text-orange-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </Card>
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
          onClick={() => router.back()}
        >
          {t('common.back')}
        </Button>
      </Card>
    );
  }

  if (!order) return null;

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        language === 'ar' ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex items-center gap-4",
          language === 'ar' && "flex-row-reverse"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className={cn(language === 'ar' && "rotate-180")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{order.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('prayer.issues.share')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t('prayer.issues.print')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Status Badge */}
        <Badge 
          variant="secondary" 
          className={cn(
            "w-fit",
            getStatusColor(order.status)
          )}
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {t(`prayer.issues.status.${order.status}`)}
        </Badge>

        {/* Images */}
        {order.images.length > 0 && (
          <Card className="overflow-hidden">
            <Carousel
              images={order.images}
              aspectRatio="video"
              className="rounded-none"
              variant="minimal"
            />
          </Card>
        )}

        {/* Details */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Meta Information */}
            <div className="grid gap-4 grid-cols-2">
              <div className={cn(
                "flex items-center gap-2",
                language === 'ar' && "flex-row-reverse"
              )}>
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {order.mosque.name}
                </span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                language === 'ar' && "flex-row-reverse"
              )}>
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US'
                  )}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className={cn(
                "flex items-center gap-2 text-primary",
                language === 'ar' && "flex-row-reverse"
              )}>
                <FileText className="h-5 w-5" />
                <h2 className="font-medium">{t('prayer.issues.description')}</h2>
              </div>
              <p className={cn(
                "text-muted-foreground whitespace-pre-wrap text-start"
              )}>
                {order.description}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className={cn(
                "flex items-center gap-2 text-primary",
                language === 'ar' && "flex-row-reverse"
              )}>
                <ListPlus className="h-5 w-5" />
                <h2 className="font-medium">{t('prayer.issues.items')}</h2>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className={cn(
                        "flex items-center justify-between",
                        language === 'ar' && "flex-row-reverse"
                      )}>
                        <span className="font-medium">
                          {t('prayer.issues.item')} {index + 1}
                        </span>
                        <Badge variant="secondary">
                          {t('prayer.issues.quantity')}: {item.quantity}
                        </Badge>
                      </div>

                      {item.images.length > 0 && (
                        <Card className="overflow-hidden">
                          <Carousel
                            images={item.images}
                            aspectRatio="square"
                            className="rounded-none"
                            variant="minimal"
                          />
                        </Card>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 