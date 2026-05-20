export type CameraStatus = 'live' | 'offline' | 'no-signal';
export type CameraLocation = 
  | 'entrance'
  | 'exit'
  | 'prayerHall'
  | 'courtyard'
  | 'parking'
  | 'womenSection'
  | 'ablution'
  | 'minaret'
  | 'dome'
  | 'corridor'
  | 'storage'
  | 'utility'
  | 'garden'
  | 'gate'
  | 'perimeter';

export interface CCTVCamera {
  id: string;
  name: string;
  location: CameraLocation;
  status: CameraStatus;
  thumbnail: string;
  stream_url: string;
  last_online: string;
}

export interface CCTVRecording {
  id: string;
  camera_id: string;
  camera_name: string;
  location: CameraLocation;
  thumbnail: string;
  video_url: string;
  start_time: string;
  end_time: string;
  duration: number; // in seconds
  size: number; // in bytes
  has_motion: boolean;
  has_sound: boolean;
}

export interface RecordingsFilter {
  camera_id?: string;
  start_date?: string;
  end_date?: string;
  location?: CameraLocation;
  has_motion?: boolean;
  has_sound?: boolean;
  search?: string;
} 