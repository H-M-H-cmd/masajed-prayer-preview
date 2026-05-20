import { BaseService } from '../../base.service';
import { ApiResponse } from '@/types/api';

export interface PrayerOrderItem {
  product_id: string;
  quantity: number;
  images: string[];
}

export interface CreatePrayerOrderData {
  images: string[];
  mosque_id: string;
  items: PrayerOrderItem[];
  title: string;
  description: string;
}

export interface PrayerOrder {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'pending' | 'inProgress' | 'completed' | 'cancelled';
  mosque: {
    id: string;
    name: string;
  };
  items: PrayerOrderItem[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface PrayerOrderPaginationMeta {
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

export interface PrayerOrderPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PrayerOrderPaginatedResponse {
  message: string;
  data: {
    data: PrayerOrder[];
    links: PrayerOrderPaginationLinks;
    meta: PrayerOrderPaginationMeta;
  };
}

// Add mock data
const mockOrders: PrayerOrder[] = [
  {
    id: "1",
    title: "صيانة مكيفات المسجد",
    description: "المكيفات في القاعة الرئيسية تحتاج إلى صيانة عاجلة",
    status: "new",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    items: [
      {
        product_id: "1",
        quantity: 2,
        images: ["/assets/examples/ac-1.jpg", "/assets/examples/ac-2.jpg"]
      }
    ],
    images: ["/assets/examples/mosque-ac.jpg"],
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z"
  },
  {
    id: "2",
    title: "تجديد سجاد المسجد",
    description: "السجاد في حاجة إلى تجديد في الجزء الخلفي من المسجد",
    status: "inProgress",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    items: [
      {
        product_id: "2",
        quantity: 10,
        images: ["/assets/examples/carpet-1.jpg"]
      }
    ],
    images: ["/assets/examples/mosque-carpet.jpg", "/assets/examples/carpet-damage.jpg"],
    created_at: "2024-03-19T15:30:00Z",
    updated_at: "2024-03-19T15:30:00Z"
  },
  {
    id: "3",
    title: "صيانة دورات المياه",
    description: "بعض الصنابير تحتاج إلى استبدال وإصلاح التسريبات",
    status: "completed",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    items: [
      {
        product_id: "3",
        quantity: 5,
        images: ["/assets/examples/tap-1.jpg"]
      }
    ],
    images: ["/assets/examples/bathroom.jpg"],
    created_at: "2024-03-18T09:15:00Z",
    updated_at: "2024-03-18T09:15:00Z"
  },
  {
    id: "4",
    title: "تركيب كاميرات مراقبة",
    description: "تركيب نظام مراقبة جديد لتأمين المسجد",
    status: "pending",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    items: [
      {
        product_id: "4",
        quantity: 8,
        images: ["/assets/examples/camera-1.jpg"]
      }
    ],
    images: ["/assets/examples/security.jpg"],
    created_at: "2024-03-17T14:45:00Z",
    updated_at: "2024-03-17T14:45:00Z"
  },
  {
    id: "5",
    title: "صيانة نظام الصوت",
    description: "بعض السماعات لا تعمل وتحتاج إلى استبدال",
    status: "cancelled",
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    items: [
      {
        product_id: "5",
        quantity: 4,
        images: ["/assets/examples/speaker-1.jpg"]
      }
    ],
    images: ["/assets/examples/sound-system.jpg"],
    created_at: "2024-03-16T11:20:00Z",
    updated_at: "2024-03-16T11:20:00Z"
  }
];

class PrayerOrderService extends BaseService {
  constructor() {
    super('/orders');
  }

  async createOrder(data: CreatePrayerOrderData): Promise<ApiResponse<PrayerOrder>> {
    // In development, return mock response
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newOrder: PrayerOrder = {
            id: (mockOrders.length + 1).toString(),
            title: data.title,
            description: data.description,
            status: "new",
            mosque: {
              id: data.mosque_id,
              name: "مسجد ابو بكر الصديق"
            },
            items: data.items.map(item => ({
              ...item,
              images: Array.isArray(item.images) ? item.images.map(img => typeof img === 'string' ? img : URL.createObjectURL(img as Blob)) : []
            })),
            images: Array.isArray(data.images) ? data.images.map(img => typeof img === 'string' ? img : URL.createObjectURL(img as Blob)) : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          mockOrders.unshift(newOrder);
          resolve({ data: newOrder, message: "Success", status: 200 });
        }, 1000);
      });
    }

    const formData = new FormData();
    
    // Append basic data
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('mosque_id', data.mosque_id);
    
    // Append order items
    formData.append('items', JSON.stringify(data.items));
    
    // Append main order images
    data.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    // Append item images
    data.items.forEach((item, itemIndex) => {
      item.images.forEach((image, imageIndex) => {
        formData.append(`items[${itemIndex}][images][${imageIndex}]`, image);
      });
    });

    const { data: responseData } = await this.api.post<ApiResponse<PrayerOrder>>(
      this.endpoint,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return responseData;
  }

  async getOrders(params?: {
    search?: string;
    page?: number;
    per_page?: number;
    status?: string;
    mosque_id?: string;
  }): Promise<PrayerOrderPaginatedResponse> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredOrders = [...mockOrders];
          
          // Apply filters
          if (params?.status) {
            filteredOrders = filteredOrders.filter(order => order.status === params.status);
          }
          if (params?.mosque_id) {
            filteredOrders = filteredOrders.filter(order => order.mosque.id === params.mosque_id);
          }

          // Apply pagination
          const page = params?.page || 1;
          const per_page = params?.per_page || 10;
          const start = (page - 1) * per_page;
          const end = start + per_page;
          const paginatedOrders = filteredOrders.slice(start, end);
          
          resolve({
            message: "Orders retrieved successfully",
            data: {
              data: paginatedOrders,
              meta: {
                current_page: page,
                from: start + 1,
                last_page: Math.ceil(filteredOrders.length / per_page),
                path: "/orders",
                per_page: per_page,
                to: Math.min(end, filteredOrders.length),
                total: filteredOrders.length,
                links: []
              },
              links: {
                first: "/orders?page=1",
                last: `/orders?page=${Math.ceil(filteredOrders.length / per_page)}`,
                prev: page > 1 ? `/orders?page=${page - 1}` : null,
                next: end < filteredOrders.length ? `/orders?page=${page + 1}` : null
              }
            }
          });
        }, 500);
      });
    }

    const { data } = await this.api.get<PrayerOrderPaginatedResponse>(this.endpoint, { params });
    return data;
  }

  async getOrder(id: string): Promise<ApiResponse<PrayerOrder>> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const order = mockOrders.find(o => o.id === id);
          if (order) {
            resolve({ data: order, message: "Success", status: 200 });
          } else {
            throw new Error('Order not found');
          }
        }, 500);
      });
    }

    const { data } = await this.api.get<ApiResponse<PrayerOrder>>(`${this.endpoint}/${id}`);
    return data;
  }

  async updateOrderStatus(id: string, status: PrayerOrder['status']): Promise<ApiResponse<PrayerOrder>> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const orderIndex = mockOrders.findIndex(o => o.id === id);
          if (orderIndex !== -1) {
            mockOrders[orderIndex] = {
              ...mockOrders[orderIndex],
              status,
              updated_at: new Date().toISOString()
            };
            resolve({ data: mockOrders[orderIndex], message: "Success", status: 200 });
          } else {
            throw new Error('Order not found');
          }
        }, 500);
      });
    }

    const { data } = await this.api.patch<ApiResponse<PrayerOrder>>(`${this.endpoint}/${id}/status`, { status });
    return data;
  }
}

export const prayerOrderService = new PrayerOrderService(); 