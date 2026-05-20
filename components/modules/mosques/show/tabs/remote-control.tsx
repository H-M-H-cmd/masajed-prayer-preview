"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { iotService } from "@/services/iot.service";
import { IoTDevice, DeviceSchedule, CreateScheduleData, UpdateDeviceData, WeekDay } from "@/types/iot-device";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Thermometer,
  Clock,
  Sun,
  Calendar,
  Droplets,
  Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types/api";

interface RemoteControlProps {
  mosqueId: string;
}

interface DeviceUpdateData extends UpdateDeviceData {
  id: string;
}

type DeviceTab = 'all' | 'ac' | 'light' | 'fan' | 'door' | 'speaker';

export function RemoteControlTab({ mosqueId }: RemoteControlProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<DeviceTab>('all');

  const { data: devicesData, execute: fetchDevices } = useApi(() =>
    iotService.getDevices(mosqueId)
  );

  const { execute: updateDevice } = useApi<ApiResponse<IoTDevice>, DeviceUpdateData>(
    async (data) => iotService.updateDevice(data.id, {
      status: data.status,
      temperature: data.temperature,
      brightness: data.brightness
    }),
    {
      onSuccess: () => {
        toast({
          title: t("remoteControl.updateSuccess"),
          description: t("common.success"),
        });
        void fetchDevices();
      },
      onError: (error) => {
        toast({
          title: t("remoteControl.updateError"),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleToggleDevice = React.useCallback(async (device: IoTDevice) => {
    await updateDevice({
      id: device.id,
      status: device.status === "on" ? "off" : "on"
    });
  }, [updateDevice]);

  const handleTemperatureChange = React.useCallback(async (device: IoTDevice, temp: number) => {
    if (device.type !== "ac") return;
    await updateDevice({
      id: device.id,
      temperature: temp,
      status: device.status
    });
  }, [updateDevice]);

  const handleBrightnessChange = React.useCallback(async (device: IoTDevice, brightness: number) => {
    if (device.type !== "light") return;
    await updateDevice({
      id: device.id,
      brightness,
      status: device.status
    });
  }, [updateDevice]);

  const handleAddSchedule = React.useCallback(async (data: CreateScheduleData) => {
    try {
      await iotService.createSchedule(data);
      toast({
        title: t("remoteControl.scheduleAdded"),
        description: t("common.success"),
      });
      void fetchDevices();
    } catch (error) {
      toast({
        title: t("remoteControl.scheduleError"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, []);

  const getPowerConsumptionColor = React.useCallback((consumption: number) => {
    if (consumption < 1) return "text-green-500";
    if (consumption < 2) return "text-yellow-500";
    return "text-red-500";
  }, []);

  const formatMaintenanceDate = React.useCallback((date: string) => {
    const maintenanceDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      date: maintenanceDate.toLocaleDateString(),
      needsMaintenance: diffDays > 90
    };
  }, []);

  const stats = React.useMemo(() => {
    if (!devicesData?.data) return null;
    
    return {
      activeDevices: devicesData.data.filter(d => d.status === "on").length,
      totalDevices: devicesData.data.length,
      totalPowerConsumption: devicesData.data.reduce((acc, device) => acc + device.power_consumption, 0).toFixed(2),
      devicesNeedingMaintenance: devicesData.data.filter(d => {
        const { needsMaintenance } = formatMaintenanceDate(d.last_maintenance);
        return needsMaintenance;
      }).length
    };
  }, [devicesData?.data, formatMaintenanceDate]);

  const filteredDevices = React.useMemo(() => {
    if (!devicesData?.data) return [];
    if (activeTab === 'all') return devicesData.data;
    return devicesData.data.filter(device => device.type === activeTab);
  }, [devicesData?.data, activeTab]);

  React.useEffect(() => {
    void fetchDevices();
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("remoteControl.activeDevices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeDevices} / {stats.totalDevices}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("remoteControl.totalPowerConsumption")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPowerConsumption} kW
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t("remoteControl.devicesNeedingMaintenance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.devicesNeedingMaintenance}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-b">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'all' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.filters.all")}
          </button>
          <button
            onClick={() => setActiveTab('ac')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'ac' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.deviceTypes.ac")}
          </button>
          <button
            onClick={() => setActiveTab('light')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'light' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.deviceTypes.light")}
          </button>
          <button
            onClick={() => setActiveTab('fan')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'fan' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.deviceTypes.fan")}
          </button>
          <button
            onClick={() => setActiveTab('door')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'door' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.deviceTypes.door")}
          </button>
          <button
            onClick={() => setActiveTab('speaker')}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-primary",
              activeTab === 'speaker' 
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {t("remoteControl.deviceTypes.speaker")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onToggle={handleToggleDevice}
            onTemperatureChange={handleTemperatureChange}
            onBrightnessChange={handleBrightnessChange}
            onAddSchedule={handleAddSchedule}
            getPowerConsumptionColor={getPowerConsumptionColor}
            formatMaintenanceDate={formatMaintenanceDate}
          />
        ))}
      </div>
    </div>
  );
}

const DeviceCard = React.memo(function DeviceCard({
  device,
  onToggle,
  onTemperatureChange,
  onBrightnessChange,
  onAddSchedule,
  getPowerConsumptionColor,
  formatMaintenanceDate
}: {
  device: IoTDevice;
  onToggle: (device: IoTDevice) => Promise<void>;
  onTemperatureChange: (device: IoTDevice, temp: number) => Promise<void>;
  onBrightnessChange: (device: IoTDevice, brightness: number) => Promise<void>;
  onAddSchedule: (data: CreateScheduleData) => Promise<void>;
  getPowerConsumptionColor: (consumption: number) => string;
  formatMaintenanceDate: (date: string) => { date: string; needsMaintenance: boolean };
}) {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await onToggle(device);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSliderChange = async (value: number) => {
    try {
      setIsUpdating(true);
      if (device.type === "ac") {
        await onTemperatureChange(device, value);
      } else if (device.type === "light") {
        await onBrightnessChange(device, value);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={cn(
      "relative transition-all duration-200",
      device.status === "on" ? "border-green-500/50" : "border-gray-200",
      !device.is_online && "opacity-50"
    )}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="font-medium">{device.name}</h3>
            <p className="text-sm text-muted-foreground">{device.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs",
              device.is_online ? "text-green-500" : "text-red-500"
            )}>
              {device.is_online ? t("remoteControl.online") : t("remoteControl.offline")}
            </span>
            <Switch
              checked={device.status === "on"}
              onCheckedChange={handleToggle}
              disabled={!device.is_online || isUpdating}
            />
          </div>
        </div>

        {device.type === "ac" && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm">{t("remoteControl.temperature")}</span>
              </div>
              <span className="text-sm font-medium">{device.temperature}°C</span>
            </div>
            <Slider
              value={[device.temperature || 24]}
              min={16}
              max={30}
              step={1}
              onValueChange={([value]) => handleSliderChange(value)}
              disabled={!device.is_online || device.status === "off" || isUpdating}
              className="my-2"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>{device.humidity}%</span>
            </div>
          </div>
        )}

        {device.type === "light" && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span className="text-sm">{t("remoteControl.brightness")}</span>
              </div>
              <span className="text-sm font-medium">{device.brightness}%</span>
            </div>
            <Slider
              value={[device.brightness || 0]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => handleSliderChange(value)}
              disabled={!device.is_online || device.status === "off" || isUpdating}
              className="my-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm pt-4 border-t">
          <div className="flex items-center gap-2">
            <Zap className={cn("h-4 w-4", getPowerConsumptionColor(device.power_consumption))} />
            <span>{device.power_consumption} kW</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs",
              formatMaintenanceDate(device.last_maintenance).needsMaintenance 
                ? "text-red-500" 
                : "text-muted-foreground"
            )}>
              {t("remoteControl.lastMaintenance")}: {formatMaintenanceDate(device.last_maintenance).date}
            </span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              disabled={!device.is_online}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t("remoteControl.schedules")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {`${t("remoteControl.scheduleTitle")} - ${device.name}`}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 p-4">
                {device.schedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={async () => {
                      await iotService.deleteSchedule(device.id, schedule.id);
                    }}
                  />
                ))}
                <AddScheduleForm
                  deviceId={device.id}
                  onSubmit={onAddSchedule}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

function ScheduleCard({
  schedule,
  onDelete,
}: {
  schedule: DeviceSchedule;
  onDelete: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await onDelete();
      toast({
        title: t("remoteControl.scheduleDeleted"),
        description: t("common.success"),
      });
    } catch (error) {
      toast({
        title: t("remoteControl.deleteError"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const formatScheduleTime = (schedule: DeviceSchedule) => {
    if (schedule.type === "prayer") {
      return (
        <>
          {schedule.start_before} {t("remoteControl.beforePrayer")}
          {" - "}
          {schedule.end_after} {t("remoteControl.afterPrayer")}
        </>
      );
    }
    return `${schedule.start_time} - ${schedule.end_time}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {schedule.type === "prayer" ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>
                {schedule.type === "prayer"
                  ? t(`prayer.names.${schedule.prayer}`)
                  : `${schedule.start_time} - ${schedule.end_time}`}
              </span>
            </div>
            {schedule.type === "prayer" && (
              <div className="text-sm text-muted-foreground">
                {formatScheduleTime(schedule)}
              </div>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            {t("common.delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddScheduleForm({
  deviceId,
  onSubmit,
}: {
  deviceId: string;
  onSubmit: (data: CreateScheduleData) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [type, setType] = React.useState<"prayer" | "custom">("prayer");
  const [prayer, setPrayer] = React.useState<string>("");
  const [startBefore, setStartBefore] = React.useState("15");
  const [endAfter, setEndAfter] = React.useState("30");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [days, setDays] = React.useState<WeekDay[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      device_id: deviceId,
      type,
      ...(type === "prayer"
        ? {
            prayer: prayer as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
            start_before: parseInt(startBefore),
            end_after: parseInt(endAfter),
          }
        : {
            start_time: startTime,
            end_time: endTime,
          }),
      days,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={type} onValueChange={(value: "prayer" | "custom") => setType(value)}>
        <SelectTrigger>
          <SelectValue placeholder={t("remoteControl.selectScheduleType")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prayer">{t("remoteControl.prayerBased")}</SelectItem>
          <SelectItem value="custom">{t("remoteControl.customTime")}</SelectItem>
        </SelectContent>
      </Select>

      {type === "prayer" ? (
        <>
          <Select value={prayer} onValueChange={setPrayer}>
            <SelectTrigger>
              <SelectValue placeholder={t("remoteControl.selectPrayer")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fajr">{t("prayer.names.fajr")}</SelectItem>
              <SelectItem value="dhuhr">{t("prayer.names.dhuhr")}</SelectItem>
              <SelectItem value="asr">{t("prayer.names.asr")}</SelectItem>
              <SelectItem value="maghrib">{t("prayer.names.maghrib")}</SelectItem>
              <SelectItem value="isha">{t("prayer.names.isha")}</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder={t("remoteControl.minutesBefore")}
              value={startBefore}
              onChange={(e) => setStartBefore(e.target.value)}
            />
            <Input
              type="number"
              placeholder={t("remoteControl.minutesAfter")}
              value={endAfter}
              onChange={(e) => setEndAfter(e.target.value)}
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("remoteControl.selectDays")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ].map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day}
                checked={days.includes(day as WeekDay)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setDays([...days, day as WeekDay]);
                  } else {
                    setDays(days.filter((d) => d !== day));
                  }
                }}
              />
              <label htmlFor={day} className="text-sm">
                {t(`common.days.${day}`)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {t("remoteControl.addSchedule")}
      </Button>
    </form>
  );
} 