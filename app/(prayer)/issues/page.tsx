"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { prayerOrderService, PrayerOrder } from "@/services/v-2/prayer/issues.service";
import Link from "next/link";
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";

export default function IssuesPage() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orders, setOrders] = useState<PrayerOrder[]>([]);
  const [currentPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await prayerOrderService.getOrders({
        page: currentPage,
        per_page: 10
      });
      setOrders(response.data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <div className={cn(
          "flex items-center justify-between",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Issues List Skeleton */}
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
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className={cn(
        "flex items-center justify-between",
        language === 'ar' ? "flex-row-reverse" : "flex-row"
      )}>
        <h2 className="text-lg font-semibold">
          {t('prayer.issues.title')}
        </h2>
        <Link href="/issues/create">
          <Button size="sm" className={cn(
            "gap-1",
            language === 'ar' && "flex-row-reverse"
          )}>
            <Plus className="h-4 w-4" />
            {t('prayer.issues.addIssue')}
          </Button>
        </Link>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-8 w-8" />
              <p>{t('prayer.issues.noIssues')}</p>
              <Link href="/issues/create">
                <Button variant="outline" size="sm" className="mt-2">
                  {t('prayer.issues.addIssue')}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <Link key={order.id} href={`/issues/${order.id}`}>
                <Card
                  className={cn(
                    "p-4 transition-colors hover:bg-muted/50 mb-4",
                    "cursor-pointer group"
                  )}
                >
                  <div className="space-y-3">
                    {/* Issue Header */}
                    <div className={cn(
                      "flex items-start justify-between gap-2",
                      language === 'ar' && "flex-row-reverse"
                    )}>
                      <div className="space-y-1">
                        <h3 className="font-medium">{order.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.mosque.name}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        "group-hover:translate-x-0.5",
                        language === 'ar' && "rotate-180 group-hover:-translate-x-0.5"
                      )} />
                    </div>

                    {/* Issue Meta */}
                    <div className={cn(
                      "flex flex-wrap items-center gap-2 text-sm",
                      language === 'ar' && "flex-row-reverse"
                    )}>
                      <Badge variant="secondary" className={cn(
                        getStatusColor(order.status),
                        "flex items-center gap-1",
                        language === 'ar' && "flex-row-reverse"
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {t(`prayer.issues.status.${order.status}`)}
                      </Badge>
                      
                      {order.created_at && (
                        <Badge variant="outline" className={cn(
                          "flex items-center gap-1",
                          language === 'ar' && "flex-row-reverse"
                        )}>
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString(
                            language === 'ar' ? 'ar-SA' : 'en-US'
                          )}
                        </Badge>
                      )}

                      {order.images?.length > 0 && (
                        <Badge variant="outline" className={cn(
                          "flex items-center gap-1",
                          language === 'ar' && "flex-row-reverse"
                        )}>
                          <ImageIcon className="h-3 w-3" />
                          {order.images.length}
                        </Badge>
                      )}
                    </div>

                    {/* Description Preview */}
                    <p className={cn(
                      "text-sm text-muted-foreground line-clamp-2 text-start"
                    )}>
                      {order.description}
                    </p>
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