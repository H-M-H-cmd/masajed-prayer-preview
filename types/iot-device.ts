export type DeviceType = 'ac' | 'light' | 'fan' | 'door' | 'speaker';
export type DeviceStatus = 'on' | 'off' | 'error' | 'maintenance';
export type ScheduleType = 'prayer' | 'custom';
export type WeekDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface DeviceSchedule {
  id: string;
  device_id: string;
  type: ScheduleType;
  prayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  start_before?: number; // minutes before prayer
  end_after?: number; // minutes after prayer
  start_time?: string; // for custom schedule
  end_time?: string; // for custom schedule
  days: WeekDay[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  is_online: boolean;
  temperature?: number; // for AC units
  humidity?: number; // for AC units
  brightness?: number; // for lights (0-100)
  power_consumption: number;
  last_maintenance: string;
  schedules: DeviceSchedule[];
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleData {
  device_id: string;
  type: ScheduleType;
  prayer?: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  start_before?: number;
  end_after?: number;
  start_time?: string;
  end_time?: string;
  days: WeekDay[];
  is_active: boolean;
}

export interface UpdateDeviceData {
  status?: DeviceStatus;
  temperature?: number;
  brightness?: number;
} 