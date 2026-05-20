"use client";

import * as React from "react";
import { Rating } from "@/types/rating";
import { ratingService } from "@/services/v-2/prayer/rating.service";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/providers/language-provider';
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";

interface RatingsTabProps {
    mosqueId: string;
}

const ITEMS_PER_PAGE = 10;

export const RatingsTab: React.FC<RatingsTabProps> = ({ mosqueId }) => {
    const { t } = useLanguage();
    const [ratings, setRatings] = React.useState<Rating[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [sortBy, setSortBy] = React.useState("newest");
    const [page, setPage] = React.useState(1);
    const [totalItems, setTotalItems] = React.useState(0);
    const [selectedRating, setSelectedRating] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<'all' | 'pending' | 'approved'>('all');
    const [actionLoading, setActionLoading] = React.useState<string | null>(null);

    const fetchRatings = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await ratingService.getRatings(mosqueId, {
                page,
                limit: ITEMS_PER_PAGE,
                sort: sortBy,
                status
            });
            setRatings(response.data.data);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error("Error fetching ratings:", error);
        } finally {
            setLoading(false);
        }
    }, [mosqueId, page, sortBy, status]);

    React.useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    const handleApprove = async (ratingId: string) => {
        try {
            setActionLoading(ratingId);
            await ratingService.approveRating(ratingId);
            toast.success(t("prayer.ratings.approveSuccess"));
            setSelectedRating(null);
            fetchRatings();
        } catch (error) {
            console.error("Error approving rating:", error);
            toast.error(t("prayer.ratings.approveError"));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (ratingId: string) => {
        try {
            setActionLoading(ratingId);
            await ratingService.rejectRating(ratingId);
            toast.success(t("prayer.ratings.rejectSuccess"));
            setSelectedRating(null);
            fetchRatings();
        } catch (error) {
            console.error("Error rejecting rating:", error);
            toast.error(t("prayer.ratings.rejectError"));
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={(value) => {
                        setSortBy(value);
                        setPage(1); // Reset to first page when sorting changes
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t("prayer.sortBy.newest")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("prayer.sortBy.newest")}</SelectItem>
                            <SelectItem value="highest">{t("prayer.sortBy.highest")}</SelectItem>
                            <SelectItem value="lowest">{t("prayer.sortBy.lowest")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={status} onValueChange={(value: 'all' | 'pending' | 'approved') => {
                        setStatus(value);
                        setPage(1); // Reset to first page when status changes
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t("prayer.statuses.pending")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("prayer.statuses.all")}</SelectItem>
                            <SelectItem value="pending">{t("prayer.statuses.pending")}</SelectItem>
                            <SelectItem value="approved">{t("prayer.statuses.approved")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                {ratings.map((rating) => (
                    <Card
                        key={rating.id}
                        className={cn(
                            "p-4 cursor-pointer transition-colors",
                            selectedRating === rating.id && "bg-muted/50",
                            rating.status === 'pending' && "border-l-4 border-l-yellow-500",
                            rating.status === 'approved' && "border-l-4 border-l-green-500",
                            rating.status === 'rejected' && "border-l-4 border-l-red-500",

                            "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedRating(rating.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-full flex items-center justify-between">
                                <h4 className="font-semibold">
                                    {rating.user.name}
                                </h4>
                                <div className="flex flex-row items-center gap-4">
                                    <span className="text-sm text-muted-foreground mt-1">
                                        {format(new Date(rating.created_at), "dd MMMM yyyy", { locale: ar })}
                                    </span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "w-4 h-4",
                                                    star <= rating.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <p className="mt-4 text-foreground/90">{rating.comment}</p>

                            {selectedRating === rating.id && (
                                <div className="flex items-center gap-2 mt-4 justify-end">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={actionLoading !== null}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(rating.id);
                                        }}
                                    >
                                        {actionLoading === rating.id ? (
                                            <span className="flex items-center gap-2">
                                                <span className="loading loading-spinner loading-xs" />
                                                {t("common.processing")}
                                            </span>
                                        ) : (
                                            t("common.reject")
                                        )}
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={actionLoading !== null}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprove(rating.id);
                                        }}
                                    >
                                        {actionLoading === rating.id ? (
                                            <span className="flex items-center gap-2">
                                                <span className="loading loading-spinner loading-xs" />
                                                {t("common.processing")}
                                            </span>
                                        ) : (
                                            t("common.approve")
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                    </Card>
                ))}

                {ratings.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                        {t("prayer.ratings.noRatings")}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        {t("common.showing")} {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, totalItems)} {t("common.of")} {totalItems}
                    </p>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}; 