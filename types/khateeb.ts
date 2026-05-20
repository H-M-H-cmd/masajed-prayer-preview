export interface KhutbahRecording {
  id: string;
  title: string;
  date: string;
  duration: number; // in seconds
  video_url: string;
  thumbnail: string;
  transcript_url: string; // PDF URL
  status: 'processing' | 'completed' | 'failed';
  language: 'ar' | 'en';
  khateeb_name: string;
  size: number; // in bytes
  tags: string[];
  summary?: string;
}

export interface KhutbahFilter {
  search?: string;
  start_date?: string;
  end_date?: string;
  status?: 'processing' | 'completed' | 'failed';
  language?: 'ar' | 'en';
  khateeb?: string;
} 