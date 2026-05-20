"use client";

import * as React from "react";
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import type { MapMouseEvent } from '@vis.gl/react-google-maps';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

// Center coordinates for Saudi Arabia
const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 };
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 12;

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange?: (location: { lat: number; lng: number }) => void;
  className?: string;
  required?: boolean;
  defaultCenter?: { lat: number; lng: number };
}

export function MapPicker({ value, onChange, className, required, defaultCenter }: MapPickerProps) {
  const { t } = useLanguage();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleMapClick = React.useCallback((event: MapMouseEvent) => {
    const position = {
      lat: event.detail.latLng?.lat,
      lng: event.detail.latLng?.lng,
    };
    
    onChange?.(position as { lat: number; lng: number });
  }, [onChange]);

  const handleMarkerDragEnd = React.useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    
    const position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    
    onChange?.(position);
  }, [onChange]);

  const handleApiLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleApiError = React.useCallback((error: unknown) => {
    setError(t('locations.form.mapLoadError'));
    console.error('Google Maps API Error:', error);
  }, [t]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-md">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={cn("relative w-full h-[400px] rounded-md overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <APIProvider 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          onLoad={handleApiLoad}
          onError={handleApiError}
        >
          <Map
            defaultCenter={defaultCenter || DEFAULT_CENTER}
            defaultZoom={defaultCenter ? SELECTED_ZOOM : DEFAULT_ZOOM}
            onClick={handleMapClick}
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
            {value && (
              <AdvancedMarker
                position={value}
                title={t('locations.form.selectedLocation')}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </Map>
        </APIProvider>
      </div>
      {required && !value && (
        <p className="text-sm text-muted-foreground">
          {t('locations.form.clickToSelectLocation')}
        </p>
      )}
    </div>
  );
} 