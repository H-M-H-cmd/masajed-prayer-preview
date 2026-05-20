"use client";

import * as React from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Mosque } from "@/types/mosque";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locationService } from "@/services/location.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { City, District } from "@/types/location";
import { cn } from "@/lib/utils";

interface MapViewProps {
    mosques: Mosque[];
    isLoading?: boolean;
}

interface MapFilters {
    search: string;
    type: string;
    related_to: string;
    region_id: string;
    city_id: string;
    district_id: string;
}

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // Saudi Arabia center
const DEFAULT_ZOOM = 6;

export function MapView({ mosques, isLoading }: MapViewProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [selectedMosque, setSelectedMosque] = React.useState<Mosque | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isMapLoading, setIsMapLoading] = React.useState(true);
    const [filters, setFilters] = React.useState<MapFilters>({
        search: "",
        type: "all",
        related_to: "all",
        region_id: "",
        city_id: "",
        district_id: "",
    });

    // Remove the useApi hooks for cities and districts
    const [loadedCities, setLoadedCities] = React.useState<City[]>([]);
    const [loadedDistricts, setLoadedDistricts] = React.useState<District[]>([]);

    // Update cities effect
    React.useEffect(() => {
        console.log('filters', filters);
        const fetchCities = async () => {
            try {
                const response = await locationService.getCities(filters.region_id, {
                    per_page: 100
                });
                if (response.data?.data) {
                    setLoadedCities(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, [filters]);

    // Update districts effect
    React.useEffect(() => {
        const fetchDistricts = async () => {
            if (!filters.city_id) {
                setLoadedDistricts([]);
                return;
            }

            try {
                const response = await locationService.getDistricts(filters.city_id, {
                    per_page: 100
                });
                if (response.data?.data) {
                    setLoadedDistricts(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        };

        fetchDistricts();
    }, [filters.city_id]);

    const filteredMosques = React.useMemo(() => {
        return mosques.filter(mosque => {
            if (filters.search && !mosque.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            if (filters.type && filters.type !== 'all' && mosque.type !== filters.type) {
                return false;
            }
            if (filters.related_to && filters.related_to !== 'all' && mosque.related_to !== filters.related_to) {
                return false;
            }
            if (filters.region_id && mosque.location?.region_id !== filters.region_id) {
                return false;
            }
            if (filters.city_id && mosque.location?.city_id !== filters.city_id) {
                return false;
            }
            if (filters.district_id && mosque.location?.district_id !== filters.district_id) {
                return false;
            }
            return true;
        });
    }, [mosques, filters]);

    const analytics = React.useMemo(() => {
        const total = mosques.length;
        const filtered = filteredMosques.length;
        const typeBreakdown = filteredMosques.reduce((acc, mosque) => {
            acc[mosque.type] = (acc[mosque.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, filtered, typeBreakdown };
    }, [mosques.length, filteredMosques]);

    const handleApiLoad = React.useCallback(() => {
        setIsMapLoading(false);
    }, []);

    const handleApiError = React.useCallback((error: unknown) => {
        setError(t('locations.form.mapLoadError'));
        console.error('Google Maps API Error:', error);
    }, [t]);

    const handleMarkerClick = React.useCallback((mosque: Mosque) => {
        setSelectedMosque(mosque);
    }, []);

    const handleInfoWindowClose = React.useCallback(() => {
        setSelectedMosque(null);
    }, []);

    const handleViewDetails = React.useCallback((mosque: Mosque) => {
        router.push(`/dashboard/mosques/${mosque.id}`);
    }, [router]);

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    if (error) {
        return (
            <div className="flex items-center justify-center h-[600px] bg-muted rounded-md">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[calc(100vh-9rem)] rounded-md overflow-hidden">
            {/* Collapsible Sidebar */}
            <div
                className={cn(
                    "absolute top-0 bottom-0 z-10 bg-background border-r transition-all duration-300 ease-in-out",
                    language === 'ar' ? "right-0" : "left-0",
                    isSidebarOpen ? "w-[300px] sm:w-[400px]" : "w-0"
                )}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(prev => !prev)}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 bg-background p-2 rounded-full shadow-md border",
                        language === 'ar'
                            ? "right-full -mr-4"
                            : "left-full -ml-4"
                    )}
                >
                    {language === 'ar'
                        ? (isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
                        : (isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
                    }
                </button>

                {/* Sidebar Content */}
                <div className={cn(
                    "h-full w-full px-4",
                    !isSidebarOpen && "hidden"
                )}>
                    <ScrollArea className="h-[calc(100%)] p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {/* Analytics Section */}
                        <div>
                            <h2 className="font-semibold mb-2">{t('mosques.analytics.title')}</h2>
                            <div className="flex items-baseline justify-between mb-1">
                                <p className="text-sm ">
                                    {analytics.filtered} {t('mosques.analytics.mosque')} / <span className="text-muted-foreground"> {t('mosques.analytics.total')} {analytics.total} </span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 mt-3">
                                {Object.entries(analytics.typeBreakdown)
                                    .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
                                    .map(([type, count]) => (
                                        <div key={type} className="flex items-center gap-2 text-sm">
                                            <span>{count}</span>
                                            <span className="text-muted-foreground">{t(`mosques.types.${type}`)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <Separator className="my-3" />

                        {/* Filters Section */}
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('common.search')}</label>
                                <Input
                                    placeholder={t('mosques.searchPlaceholder')}
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('mosques.type')}</label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('mosques.selectType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {['jamee', 'masjed', 'mosala', 'temporary', 'other'].map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(`mosques.types.${type}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('mosques.relatedTo')}</label>
                                <Select
                                    value={filters.related_to}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, related_to: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('mosques.selectRelatedTo')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {['moia', 'awqaf', 'private'].map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(`mosques.relatedTo.${type}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('locations.form.city')}</label>
                                <Select
                                    value={filters.city_id}
                                    onValueChange={(value) => setFilters(prev => ({
                                        ...prev,
                                        city_id: value === 'all' ? '' : value,
                                        district_id: ''
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('locations.form.selectCity')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {loadedCities.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {language === 'ar' && city.name_ar ? city.name_ar : city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('locations.form.district')}</label>
                                <Select
                                    disabled={!filters.city_id}
                                    value={filters.district_id}
                                    onValueChange={(value) => setFilters(prev => ({
                                        ...prev,
                                        district_id: value === 'all' ? '' : value
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('locations.form.selectDistrict')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        {loadedDistricts.map((district) => (
                                            <SelectItem key={district.id} value={district.id.toString()}>
                                                {language === 'ar' && district.name_ar ? district.name_ar : district.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Map Section */}
            <div
                className={cn(
                    "absolute top-0 bottom-0 transition-all duration-300 ease-in-out",
                    language === 'ar'
                        ? isSidebarOpen ? "right-[300px] sm:right-[400px] left-0" : "right-0 left-0"
                        : isSidebarOpen ? "left-[300px] sm:left-[400px] right-0" : "left-0 right-0"
                )}
            >
                {(isLoading || isMapLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}

                <APIProvider
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                    onLoad={handleApiLoad}
                    onError={handleApiError}
                >
                    <Map
                        defaultCenter={DEFAULT_CENTER}
                        defaultZoom={DEFAULT_ZOOM}
                        gestureHandling={'greedy'}
                        disableDefaultUI={false}
                        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
                        restriction={{
                            latLngBounds: {
                                north: 32.1543,
                                south: 16.3478,
                                west: 34.5563,
                                east: 55.6666
                            },
                            strictBounds: true
                        }}
                    >
                        {filteredMosques.map((mosque) => (
                            mosque.location?.lat && mosque.location?.lng ? (
                                <AdvancedMarker
                                    key={mosque.id}
                                    position={{
                                        lat: Number(mosque.location.lat),
                                        lng: Number(mosque.location.lng)
                                    }}
                                    title={mosque.name}
                                    onClick={() => handleMarkerClick(mosque)}
                                />
                            ) : null
                        ))}

                        {selectedMosque && selectedMosque.location && (
                            <InfoWindow
                                position={{
                                    lat: Number(selectedMosque.location.lat),
                                    lng: Number(selectedMosque.location.lng)
                                }}
                                onCloseClick={handleInfoWindowClose}
                            >
                                <div className="p-2 max-w-xs">
                                    <h3 className="font-semibold mb-2">{selectedMosque.name}</h3>
                                    <p className="text-sm mb-2">{t(`mosques.types.${selectedMosque.type}`)}</p>
                                    <Button
                                        size="sm"
                                        onClick={() => handleViewDetails(selectedMosque)}
                                    >
                                        {t('common.viewDetails')}
                                    </Button>
                                </div>
                            </InfoWindow>
                        )}
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
} 