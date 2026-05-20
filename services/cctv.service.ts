import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { CCTVCamera, CCTVRecording, RecordingsFilter } from '@/types/cctv';

// Mock data
const mockCameras: CCTVCamera[] = [
  {
    id: "1",
    name: "CAM-01",
    location: "entrance",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-01",
    stream_url: "/streams/cam1",
    last_online: new Date().toISOString()
  },
  {
    id: "2",
    name: "CAM-02",
    location: "prayerHall",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-02",
    stream_url: "/streams/cam2",
    last_online: new Date().toISOString()
  },
  {
    id: "3",
    name: "CAM-03",
    location: "womenSection",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-03",
    stream_url: "/streams/cam3",
    last_online: new Date().toISOString()
  },
  {
    id: "4",
    name: "CAM-04",
    location: "courtyard",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-04",
    stream_url: "/streams/cam4",
    last_online: new Date().toISOString()
  },
  {
    id: "5",
    name: "CAM-05",
    location: "parking",
    status: "offline",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-05",
    stream_url: "/streams/cam5",
    last_online: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: "6",
    name: "CAM-06",
    location: "ablution",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-06",
    stream_url: "/streams/cam6",
    last_online: new Date().toISOString()
  },
  {
    id: "7",
    name: "CAM-07",
    location: "minaret",
    status: "no-signal",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-07",
    stream_url: "/streams/cam7",
    last_online: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: "8",
    name: "CAM-08",
    location: "dome",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-08",
    stream_url: "/streams/cam8",
    last_online: new Date().toISOString()
  },
  {
    id: "9",
    name: "CAM-09",
    location: "corridor",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-09",
    stream_url: "/streams/cam9",
    last_online: new Date().toISOString()
  },
  {
    id: "10",
    name: "CAM-10",
    location: "storage",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-10",
    stream_url: "/streams/cam10",
    last_online: new Date().toISOString()
  },
  {
    id: "11",
    name: "CAM-11",
    location: "utility",
    status: "offline",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-11",
    stream_url: "/streams/cam11",
    last_online: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: "12",
    name: "CAM-12",
    location: "garden",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-12",
    stream_url: "/streams/cam12",
    last_online: new Date().toISOString()
  },
  {
    id: "13",
    name: "CAM-13",
    location: "gate",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-13",
    stream_url: "/streams/cam13",
    last_online: new Date().toISOString()
  },
  {
    id: "14",
    name: "CAM-14",
    location: "perimeter",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-14",
    stream_url: "/streams/cam14",
    last_online: new Date().toISOString()
  },
  {
    id: "15",
    name: "CAM-15",
    location: "exit",
    status: "live",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=CAM-15",
    stream_url: "/streams/cam15",
    last_online: new Date().toISOString()
  }
];

// Mock recordings data
const mockRecordings: CCTVRecording[] = [
  {
    id: "rec1",
    camera_id: "1",
    camera_name: "CAM-01",
    location: "entrance",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-01",
    video_url: "/recordings/rec1.mp4",
    start_time: "2024-03-20T08:00:00Z",
    end_time: "2024-03-20T08:15:00Z",
    duration: 900,
    size: 45000000,
    has_motion: true,
    has_sound: true
  },
  {
    id: "rec2",
    camera_id: "2",
    camera_name: "CAM-02",
    location: "prayerHall",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-02",
    video_url: "/recordings/rec2.mp4",
    start_time: "2024-03-20T09:00:00Z",
    end_time: "2024-03-20T09:30:00Z",
    duration: 1800,
    size: 90000000,
    has_motion: true,
    has_sound: true
  },
  {
    id: "rec3",
    camera_id: "3",
    camera_name: "CAM-03",
    location: "womenSection",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-03",
    video_url: "/recordings/rec3.mp4",
    start_time: "2024-03-20T10:00:00Z",
    end_time: "2024-03-20T10:45:00Z",
    duration: 2700,
    size: 135000000,
    has_motion: false,
    has_sound: true
  },
  {
    id: "rec4",
    camera_id: "4",
    camera_name: "CAM-04",
    location: "courtyard",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-04",
    video_url: "/recordings/rec4.mp4",
    start_time: "2024-03-20T11:00:00Z",
    end_time: "2024-03-20T11:15:00Z",
    duration: 900,
    size: 45000000,
    has_motion: true,
    has_sound: false
  },
  {
    id: "rec5",
    camera_id: "5",
    camera_name: "CAM-05",
    location: "parking",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-05",
    video_url: "/recordings/rec5.mp4",
    start_time: "2024-03-20T12:00:00Z",
    end_time: "2024-03-20T12:30:00Z",
    duration: 1800,
    size: 90000000,
    has_motion: true,
    has_sound: true
  },
  {
    id: "rec6",
    camera_id: "6",
    camera_name: "CAM-06",
    location: "ablution",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-06",
    video_url: "/recordings/rec6.mp4",
    start_time: "2024-03-20T13:00:00Z",
    end_time: "2024-03-20T13:45:00Z",
    duration: 2700,
    size: 135000000,
    has_motion: false,
    has_sound: true
  },
  {
    id: "rec7",
    camera_id: "7",
    camera_name: "CAM-07",
    location: "minaret",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-07",
    video_url: "/recordings/rec7.mp4",
    start_time: "2024-03-20T14:00:00Z",
    end_time: "2024-03-20T14:15:00Z",
    duration: 900,
    size: 45000000,
    has_motion: true,
    has_sound: false
  },
  {
    id: "rec8",
    camera_id: "8",
    camera_name: "CAM-08",
    location: "dome",
    thumbnail: "https://placehold.co/640x360/333/ffffff?text=REC-08",
    video_url: "/recordings/rec8.mp4",
    start_time: "2024-03-20T15:00:00Z",
    end_time: "2024-03-20T15:30:00Z",
    duration: 1800,
    size: 90000000,
    has_motion: true,
    has_sound: true
  }
];

class CCTVService extends BaseService {
  constructor() {
    super('/cctv');
  }

  async getCameras(mosqueId: string): Promise<ApiResponse<CCTVCamera[]>> {
    // Mock implementation
    const response = {
        data: mockCameras,
        message: "Success",
        status: 200
    };
    console.log(response);
    return response
  }

  async getRecordings(
    mosqueId: string, 
    filters: RecordingsFilter
  ): Promise<ApiResponse<CCTVRecording[]>> {
    // Mock implementation with filtering
    let filtered = [...mockRecordings];

    if (filters.camera_id) {
      filtered = filtered.filter(r => r.camera_id === filters.camera_id);
    }
    if (filters.start_date) {
      filtered = filtered.filter(r => r.start_time >= filters.start_date!);
    }

    if (filters.end_date) {
      filtered = filtered.filter(r => r.end_time <= filters.end_date!);
    }

    if (filters.has_motion !== undefined) {
      filtered = filtered.filter(r => r.has_motion === filters.has_motion);
    }

    if (filters.has_sound !== undefined) {
      filtered = filtered.filter(r => r.has_sound === filters.has_sound);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.camera_name.toLowerCase().includes(search) ||
        r.location.toLowerCase().includes(search)
      );
    }

    return {
      data: filtered,
      message: "Success",
      status: 200
    };
  }

  async downloadRecording(recordingId: string): Promise<ApiResponse<string>> {
    // Mock implementation
    return {
      data: `/api/recordings/${recordingId}/download`,
      message: "Success",
      status: 200
    };
  }
}

export const cctvService = new CCTVService(); 