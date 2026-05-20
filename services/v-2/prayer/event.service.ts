import { BaseService } from '../../base.service';
import { ApiResponse } from '@/types/api';

export interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  image: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'lecture' | 'quran' | 'workshop' | 'gathering' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  mosque: {
    id: string;
    name: string;
  };
  speakers: EventSpeaker[];
  image?: string;
  location?: string;
  max_attendees?: number;
  current_attendees?: number;
  created_at: string;
  updated_at: string;
}

export interface EventPaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export interface EventPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface EventPaginatedResponse {
  message: string;
  data: {
    data: Event[];
    links: EventPaginationLinks;
    meta: EventPaginationMeta;
  };
}

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    title: "محاضرة في فقه العبادات",
    description: "محاضرة أسبوعية في فقه العبادات يلقيها فضيلة الشيخ عبدالرحمن السديس",
    type: "lecture",
    status: "upcoming",
    start_date: "2024-03-25T18:30:00Z",
    end_date: "2024-03-25T20:00:00Z",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    speakers: [
      {
        id: "1",
        name: "الشيخ عبدالرحمن السديس",
        title: "إمام المسجد الحرام",
        image: "/assets/examples/speaker-1.jpg"
      }
    ],
    image: "/assets/examples/lecture-1.jpg",
    location: "القاعة الرئيسية",
    max_attendees: 200,
    current_attendees: 150,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z"
  },
  {
    id: "2",
    title: "دورة تحفيظ القرآن الكريم",
    description: "دورة مكثفة لحفظ وتجويد القرآن الكريم",
    type: "quran",
    status: "ongoing",
    start_date: "2024-03-01T15:00:00Z",
    end_date: "2024-04-30T17:00:00Z",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    speakers: [
      {
        id: "2",
        name: "الشيخ محمد الغامدي",
        title: "مدرس القرآن الكريم",
        image: "/assets/examples/speaker-2.jpg"
      }
    ],
    image: "/assets/examples/quran-1.jpg",
    location: "قاعة التحفيظ",
    max_attendees: 50,
    current_attendees: 45,
    created_at: "2024-02-25T09:00:00Z",
    updated_at: "2024-02-25T09:00:00Z"
  },
  {
    id: "3",
    title: "ورشة عمل في السيرة النبوية",
    description: "ورشة عمل تفاعلية حول السيرة النبوية للشباب",
    type: "workshop",
    status: "upcoming",
    start_date: "2024-04-01T16:00:00Z",
    end_date: "2024-04-01T18:00:00Z",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    speakers: [
      {
        id: "3",
        name: "د. أحمد العمري",
        title: "أستاذ السيرة النبوية",
        image: "/assets/examples/speaker-3.jpg"
      }
    ],
    image: "/assets/examples/workshop-1.jpg",
    location: "قاعة المحاضرات",
    max_attendees: 100,
    current_attendees: 80,
    created_at: "2024-03-15T11:30:00Z",
    updated_at: "2024-03-15T11:30:00Z"
  },
  {
    id: "4",
    title: "لقاء شبابي",
    description: "لقاء أسبوعي للشباب لمناقشة القضايا المعاصرة",
    type: "gathering",
    status: "completed",
    start_date: "2024-03-18T19:00:00Z",
    end_date: "2024-03-18T21:00:00Z",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    speakers: [
      {
        id: "4",
        name: "أ. خالد السعيد",
        title: "مرشد شبابي",
        image: "/assets/examples/speaker-4.jpg"
      }
    ],
    image: "/assets/examples/gathering-1.jpg",
    location: "الساحة الخارجية",
    max_attendees: 150,
    current_attendees: 120,
    created_at: "2024-03-10T14:00:00Z",
    updated_at: "2024-03-10T14:00:00Z"
  },
  {
    id: "5",
    title: "دورة في أحكام التجويد",
    description: "دورة متقدمة في أحكام التجويد",
    type: "quran",
    status: "cancelled",
    start_date: "2024-03-15T16:00:00Z",
    end_date: "2024-03-15T18:00:00Z",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    speakers: [
      {
        id: "5",
        name: "الشيخ سعد المالكي",
        title: "مقرئ ومجاز",
        image: "/assets/examples/speaker-5.jpg"
      }
    ],
    image: "/assets/examples/quran-2.jpg",
    location: "قاعة التحفيظ",
    max_attendees: 30,
    current_attendees: 0,
    created_at: "2024-03-05T13:00:00Z",
    updated_at: "2024-03-05T13:00:00Z"
  }
];

class EventService extends BaseService {
  constructor() {
    super('/events');
  }

  async getEvents(params?: {
    search?: string;
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    mosque_id?: string;
  }): Promise<EventPaginatedResponse> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredEvents = [...mockEvents];
          
          // Apply filters
          if (params?.status) {
            filteredEvents = filteredEvents.filter(event => event.status === params.status);
          }
          if (params?.type) {
            filteredEvents = filteredEvents.filter(event => event.type === params.type);
          }
          if (params?.mosque_id) {
            filteredEvents = filteredEvents.filter(event => event.mosque.id === params.mosque_id);
          }

          // Apply pagination
          const page = params?.page || 1;
          const per_page = params?.per_page || 10;
          const start = (page - 1) * per_page;
          const end = start + per_page;
          const paginatedEvents = filteredEvents.slice(start, end);
          
          resolve({
            message: "Events retrieved successfully",
            data: {
              data: paginatedEvents,
              meta: {
                current_page: page,
                from: start + 1,
                last_page: Math.ceil(filteredEvents.length / per_page),
                path: "/events",
                per_page: per_page,
                to: Math.min(end, filteredEvents.length),
                total: filteredEvents.length,
                links: []
              },
              links: {
                first: "/events?page=1",
                last: `/events?page=${Math.ceil(filteredEvents.length / per_page)}`,
                prev: page > 1 ? `/events?page=${page - 1}` : null,
                next: end < filteredEvents.length ? `/events?page=${page + 1}` : null
              }
            }
          });
        }, 500);
      });
    }

    const { data } = await this.api.get<EventPaginatedResponse>(this.endpoint, { params });
    return data;
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const event = mockEvents.find(e => e.id === id);
          if (event) {
            resolve({ data: event, message: "Success", status: 200 });
          } else {
            throw new Error('Event not found');
          }
        }, 500);
      });
    }

    const { data } = await this.api.get<ApiResponse<Event>>(`${this.endpoint}/${id}`);
    return data;
  }
}

export const eventService = new EventService(); 