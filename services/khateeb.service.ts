import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { KhutbahRecording, KhutbahFilter } from '@/types/khateeb';

// Mock data
const mockKhutbahs: KhutbahRecording[] = [
  {
    id: "1",
    title: "فضل الصدقة في رمضان",
    date: "2024-03-15T13:30:00Z",
    duration: 1800, // 30 minutes
    video_url: "/khutbah/video1.mp4",
    thumbnail: "https://placehold.co/640x360.png/333/ffffff?text=KHUTBAH-01",
    transcript_url: "/khutbah/transcript1.pdf",
    status: "completed",
    language: "ar",
    khateeb_name: "الشيخ عبدالله محمد",
    size: 256000000, // 256MB
    tags: ["رمضان", "الصدقة", "الزكاة"],
    summary: "خطبة عن فضل الصدقة في شهر رمضان المبارك وأثرها على الفرد والمجتمع"
  },
  {
    id: "2",
    title: "أهمية الوحدة في المجتمع المسلم",
    date: "2024-03-08T13:30:00Z",
    duration: 2100, // 35 minutes
    video_url: "/khutbah/video2.mp4",
    thumbnail: "https://placehold.co/640x360.png/333/ffffff?text=KHUTBAH-02",
    transcript_url: "/khutbah/transcript2.pdf",
    status: "completed",
    language: "ar",
    khateeb_name: "الشيخ أحمد علي",
    size: 312000000,
    tags: ["الوحدة", "المجتمع", "الإسلام"],
    summary: "خطبة عن أهمية الوحدة في المجتمع المسلم وآثارها على تماسك المجتمع"
  },
  {
    id: "3",
    title: "بر الوالدين",
    date: "2024-03-01T13:30:00Z",
    duration: 1920, // 32 minutes
    video_url: "/khutbah/video3.mp4",
    thumbnail: "https://placehold.co/640x360.png/333/ffffff?text=KHUTBAH-03",
    transcript_url: "/khutbah/transcript3.pdf",
    status: "processing",
    language: "ar",
    khateeb_name: "الشيخ محمد سعيد",
    size: 284000000,
    tags: ["الوالدين", "البر", "الأسرة"],
    summary: "خطبة عن فضل بر الوالدين وأهميته في الإسلام"
  },
  {
    id: "4",
    title: "The Importance of Time Management in Islam",
    date: "2024-02-23T13:30:00Z",
    duration: 1680, // 28 minutes
    video_url: "/khutbah/video4.mp4",
    thumbnail: "https://placehold.co/640x360.png/333/ffffff?text=KHUTBAH-04",
    transcript_url: "/khutbah/transcript4.pdf",
    status: "failed",
    language: "en",
    khateeb_name: "Sheikh Mohammed Abdullah",
    size: 248000000,
    tags: ["time", "management", "islam"],
    summary: "A sermon about the importance of time management in Islam and its impact on worship"
  }
];

class KhateebService extends BaseService {
  constructor() {
    super('/khutbahs');
  }

  async getKhutbahs(mosqueId: string, filters?: KhutbahFilter): Promise<ApiResponse<KhutbahRecording[]>> {
    // Mock implementation
    let filtered = [...mockKhutbahs];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(k => 
        k.title.toLowerCase().includes(search) ||
        k.khateeb_name.toLowerCase().includes(search) ||
        k.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (filters?.start_date) {
      filtered = filtered.filter(k => k.date >= filters.start_date!);
    }

    if (filters?.end_date) {
      filtered = filtered.filter(k => k.date <= filters.end_date!);
    }

    if (filters?.status) {
      filtered = filtered.filter(k => k.status === filters.status);
    }

    if (filters?.language) {
      filtered = filtered.filter(k => k.language === filters.language);
    }

    if (filters?.khateeb) {
      filtered = filtered.filter(k => k.khateeb_name === filters.khateeb);
    }

    return {
      data: filtered,
      message: "Success",
      status: 200
    };
  }

  async downloadTranscript(khutbahId: string): Promise<ApiResponse<string>> {
    return {
      data: `/api/khutbah/${khutbahId}/transcript`,
      message: "Success",
      status: 200
    };
  }
}

export const khateebService = new KhateebService(); 