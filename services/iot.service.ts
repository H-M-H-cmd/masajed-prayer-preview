import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { IoTDevice, CreateScheduleData, UpdateDeviceData, DeviceSchedule, WeekDay } from '@/types/iot-device';

// Mock data
const mockDevices: IoTDevice[] = [
  // AC Units
  {
    id: "1",
    name: "مكيف القاعة الرئيسية",
    type: "ac",
    location: "القاعة الرئيسية",
    status: "on",
    is_online: true,
    temperature: 23,
    humidity: 45,
    power_consumption: 2.8,
    last_maintenance: "2024-02-15",
    schedules: [
      {
        id: "1",
        device_id: "1",
        type: "prayer",
        prayer: "dhuhr",
        start_before: 15,
        end_after: 30,
        days: ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "2",
    name: "مكيف الدور الأول",
    type: "ac",
    location: "الدور الأول",
    status: "off",
    is_online: true,
    temperature: 24,
    humidity: 42,
    power_consumption: 2.2,
    last_maintenance: "2024-01-10",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "3",
    name: "مكيف قسم النساء",
    type: "ac",
    location: "قسم النساء",
    status: "on",
    is_online: true,
    temperature: 22,
    humidity: 48,
    power_consumption: 2.5,
    last_maintenance: "2023-12-15",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },

  // Lights
  {
    id: "4",
    name: "إضاءة القبة",
    type: "light",
    location: "القبة",
    status: "on",
    is_online: true,
    brightness: 80,
    power_consumption: 0.5,
    last_maintenance: "2024-01-15",
    schedules: [
      {
        id: "2",
        device_id: "4",
        type: "prayer",
        prayer: "maghrib",
        start_before: 10,
        end_after: 60,
        days: ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "5",
    name: "إضاءة المدخل الرئيسي",
    type: "light",
    location: "المدخل الرئيسي",
    status: "on",
    is_online: true,
    brightness: 100,
    power_consumption: 0.3,
    last_maintenance: "2024-02-01",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "6",
    name: "إضاءة المحراب",
    type: "light",
    location: "المحراب",
    status: "off",
    is_online: true,
    brightness: 0,
    power_consumption: 0.2,
    last_maintenance: "2024-01-20",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },

  // Fans
  {
    id: "7",
    name: "مروحة القاعة الرئيسية 1",
    type: "fan",
    location: "القاعة الرئيسية",
    status: "on",
    is_online: true,
    power_consumption: 0.4,
    last_maintenance: "2024-01-05",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "8",
    name: "مروحة القاعة الرئيسية 2",
    type: "fan",
    location: "القاعة الرئيسية",
    status: "off",
    is_online: true,
    power_consumption: 0.4,
    last_maintenance: "2024-01-05",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },

  // Doors
  {
    id: "9",
    name: "الباب الرئيسي",
    type: "door",
    location: "المدخل الرئيسي",
    status: "on",
    is_online: true,
    power_consumption: 0.1,
    last_maintenance: "2024-02-10",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "10",
    name: "باب الطوارئ",
    type: "door",
    location: "المخرج الخلفي",
    status: "off",
    is_online: true,
    power_consumption: 0.1,
    last_maintenance: "2024-02-10",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },

  // Speakers
  {
    id: "11",
    name: "مكبر الصوت الرئيسي",
    type: "speaker",
    location: "القاعة الرئيسية",
    status: "on",
    is_online: true,
    power_consumption: 0.3,
    last_maintenance: "2024-01-25",
    schedules: [
      {
        id: "3",
        device_id: "11",
        type: "prayer",
        prayer: "fajr",
        start_before: 20,
        end_after: 45,
        days: ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "12",
    name: "مكبر صوت المئذنة",
    type: "speaker",
    location: "المئذنة",
    status: "on",
    is_online: true,
    power_consumption: 0.4,
    last_maintenance: "2024-01-25",
    schedules: [],
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  }
];

class IoTService extends BaseService {
  constructor() {
    super('/iot');
  }

  async getDevices(mosqueId: string): Promise<ApiResponse<IoTDevice[]>> {
    // Mock implementation
    return {
      data: mockDevices,
      message: "Success",
      status: 200
    };
  }

  async updateDevice(deviceId: string, data: UpdateDeviceData): Promise<ApiResponse<IoTDevice>> {
    // Mock implementation
    const device = mockDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    // Preserve existing values and only update what's provided
    Object.assign(device, {
      ...device,
      ...data,
      status: data.status || device.status, // Preserve status if not explicitly changed
    });

    return {
      data: device,
      message: "Success",
      status: 200
    };
  }

  async createSchedule(data: CreateScheduleData): Promise<ApiResponse<DeviceSchedule>> {
    // Mock implementation
    const device = mockDevices.find(d => d.id === data.device_id);
    if (!device) {
      throw new Error("Device not found");
    }

    const schedule: DeviceSchedule = {
      id: Math.random().toString(),
      device_id: data.device_id,
      type: data.type,
      prayer: data.prayer,
      start_before: data.start_before,
      end_after: data.end_after,
      start_time: data.start_time,
      end_time: data.end_time,
      days: data.days as WeekDay[],
      is_active: data.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    device.schedules.push(schedule);

    return {
      data: schedule,
      message: "Success",
      status: 200
    };
  }

  async deleteSchedule(deviceId: string, scheduleId: string): Promise<ApiResponse<void>> {
    // Mock implementation
    const device = mockDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const scheduleIndex = device.schedules.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) {
      throw new Error("Schedule not found");
    }

    device.schedules.splice(scheduleIndex, 1);

    return {
      data: undefined,
      message: "Success",
      status: 200
    };
  }
}

export const iotService = new IoTService(); 