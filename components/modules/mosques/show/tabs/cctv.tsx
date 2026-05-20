"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { useApi } from "@/hooks/use-api";
import { cctvService } from "@/services/cctv.service";
import { CCTVCamera, CCTVRecording, RecordingsFilter, CameraLocation } from "@/types/cctv";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/DatePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Maximize2, 
  Minimize2, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Grid2X2,
  Download,
  Play,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
interface CCTVTabProps {
  mosqueId: string;
}

export function CCTVTab({ mosqueId }: CCTVTabProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<'live' | 'recordings'>('live');
  const [selectedCamera, setSelectedCamera] = React.useState<CCTVCamera | null>(null);
  const [selectedRecording, setSelectedRecording] = React.useState<CCTVRecording | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [recordingsFilter, setRecordingsFilter] = React.useState<RecordingsFilter>({});
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClearFilters = () => {
    setRecordingsFilter({});
    setSearchQuery('');
  };

  const { 
    data: camerasData, 
    execute: fetchCameras,
    isLoading,
    error
  } = useApi(() => cctvService.getCameras(mosqueId));
  
  const { 
    data: recordingsData,
    execute: fetchRecordings,
    // isLoading: isLoadingRecordings
  } = useApi(() => 
    cctvService.getRecordings(mosqueId, {
      ...recordingsFilter,
      search: searchQuery
    })
  );

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    if (activeTab === 'recordings') {
      void fetchRecordings();
    }
  }, [activeTab, recordingsFilter, searchQuery]);

  const handleCameraClick = (camera: CCTVCamera) => {
    setSelectedCamera(camera);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusIcon = (status: CCTVCamera['status']) => {
    switch (status) {
      case 'live':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'no-signal':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleDownload = async (recordingId: string) => {
    try {
      const response = await cctvService.downloadRecording(recordingId);
      console.log(response)
      toast({
        title: t('cctv.recordings.downloadSuccess'),
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: t('cctv.recordings.downloadError'),
        variant: 'destructive'
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const locations = camerasData?.data.reduce((acc, camera) => {
    if (!acc.includes(camera.location)) {
      acc.push(camera.location as CameraLocation);
    }
    return acc;
  }, [] as CameraLocation[]) || [];

  console.log('camerasData:', camerasData);

  const handlePlayRecording = (recording: CCTVRecording) => {
    setSelectedRecording(recording);
  };

  const handleCloseRecording = () => {
    setSelectedRecording(null);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden animate-pulse">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">
          {t('common.error')}: {error.message}
        </p>
      </div>
    );
  }

  if (!camerasData?.data) return null;

  if (selectedCamera) {
    return (
      <div className="h-full">
        <div className="flex justify-start mb-4 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCamera(null)}
            className="flex items-center gap-2"
          >
            <Grid2X2 className="h-4 w-4" />
            {t("cctv.viewAllCameras")}
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Main Camera View */}
          <div className={cn(
            "relative bg-black rounded-lg overflow-hidden",
            isFullscreen ? "col-span-4" : "lg:col-span-3"
          )}>
            <Image
              src={selectedCamera.thumbnail}
              alt={selectedCamera.name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                {getStatusIcon(selectedCamera.status)}
                <span>{t(`mosques.cctv.${selectedCamera.status}`)}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFullscreenToggle}
                className="bg-black/50 text-white border-0 hover:bg-black/75"
              >
                {isFullscreen ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-lg">
              <h3 className="font-medium">{selectedCamera.name}</h3>
              <p className="text-sm text-gray-300">
                {t(`cctv.locations.${selectedCamera.location}`)}
              </p>
            </div>
          </div>

          {/* Side Cameras */}
          {!isFullscreen && (
            <ScrollArea className="lg:col-span-1 h-[calc(100vh-14rem)]">
              <div className="space-y-4 pr-4">
                {camerasData.data
                  .filter(camera => camera.id !== selectedCamera.id)
                  .map(camera => (
                    <Card
                      key={camera.id}
                      className={cn(
                        "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                        "relative overflow-hidden"
                      )}
                      onClick={() => handleCameraClick(camera)}
                    >
                      <CardContent className="p-0">
                        <Image
                          src={camera.thumbnail}
                          alt={camera.name}
                          width={100}
                          height={100}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                        <div className="absolute bottom-2 left-2 text-white">
                          <p className="text-sm font-medium">{camera.name}</p>
                          <p className="text-xs">
                            {t(`cctv.locations.${camera.location}`)}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2">
                          {getStatusIcon(camera.status)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    );
  }

  if (selectedRecording) {
    return (
      <div className="h-full">
        <div className="flex justify-start mb-4 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCloseRecording}
            className="flex items-center gap-2"
          >
            <Grid2X2 className="h-4 w-4" />
            {t("cctv.recordings.backToList")}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={selectedRecording.video_url}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
          <div className="bg-card p-4 rounded-lg space-y-2">
            <h3 className="text-lg font-medium">{selectedRecording.camera_name}</h3>
            <p className="text-sm text-muted-foreground">
              {t(`cctv.locations.${selectedRecording.location}`)}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(selectedRecording.start_time).toLocaleString()}</span>
              <span>{formatDuration(selectedRecording.duration)}</span>
              <span>{formatSize(selectedRecording.size)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {selectedRecording.has_motion && (
                <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {t('cctv.recordings.hasMotion')}
                </div>
              )}
              {selectedRecording.has_sound && (
                <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {t('cctv.recordings.hasSound')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs dir={language === 'ar' ? 'rtl' : 'ltr'} value={activeTab} onValueChange={(value) => setActiveTab(value as 'live' | 'recordings')}>
      <div className="flex justify-center mb-4">
        <TabsList>
          <TabsTrigger value="live">{t('cctv.tabs.live')}</TabsTrigger>
          <TabsTrigger value="recordings">{t('cctv.tabs.recordings')}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="live">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {camerasData.data.map(camera => (
            <Card
              key={camera.id}
              className={cn(
                "cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                "relative overflow-hidden"
              )}
              onClick={() => handleCameraClick(camera)}
            >
              <CardContent className="p-0">
                <Image
                  src={camera.thumbnail}
                  alt={camera.name}
                  width={100}
                  height={100}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-medium">{camera.name}</h3>
                  <p className="text-sm">
                    {t(`cctv.locations.${camera.location}`)}
                  </p>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full">
                  {getStatusIcon(camera.status)}
                  <span className="text-sm">{t(`cctv.${camera.status}`)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recordings">
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-medium">{t('cctv.recordings.title')}</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!searchQuery && Object.keys(recordingsFilter).length === 0}
              >
                {t('common.clearFilters')}
              </Button>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('cctv.recordings.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={recordingsFilter.location}
                onValueChange={(value) => 
                  setRecordingsFilter(prev => ({ 
                    ...prev, 
                    location: value === 'all' ? undefined : value as CameraLocation
                  }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('cctv.filters.byLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('cctv.filters.all')}
                  </SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {t(`cctv.locations.${location}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4">
                <DatePicker
                  date={recordingsFilter.start_date}
                  setDate={(date) => setRecordingsFilter(prev => ({ ...prev, start_date: date }))}
                  placeHolder={t('cctv.recordings.startDate')}
                />
                <DatePicker
                  date={recordingsFilter.end_date}
                  setDate={(date) => setRecordingsFilter(prev => ({ ...prev, end_date: date }))}
                  placeHolder={t('cctv.recordings.endDate')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recordingsData?.data.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {t('cctv.recordings.noRecordings')}
              </div>
            ) : (
              recordingsData?.data.map(recording => (
                <Card key={recording.id} className="relative overflow-hidden">
                  <CardContent className="p-0">
                    <Image
                      width={100}
                      height={100}
                      src={recording.thumbnail}
                      alt={recording.camera_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-medium">{recording.camera_name}</h3>
                      <p className="text-sm">
                        {t(`cctv.locations.${recording.location}`)}
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(recording.start_time).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-300">
                        <span>{formatDuration(recording.duration)}</span>
                        <span>{formatSize(recording.size)}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownload(recording.id)}
                        className="bg-black/50 text-white border-0 hover:bg-black/75"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePlayRecording(recording)}
                        className="bg-black/50 text-white border-0 hover:bg-black/75"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
} 