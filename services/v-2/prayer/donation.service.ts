import { BaseService } from '../../base.service';
import { ApiResponse } from '@/types/api';

export interface DonationData {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  mosque: {
    id: string;
    name: string;
  };
  order_id: string; // Reference to the prayer order/issue
  image?: string;
  donor_count: number;
  created_at: string;
  updated_at: string;
  priority: 'urgent' | 'priority' | 'regular';
  recent_donors?: Array<{
    name: string;
    amount: number;
    created_at: string;
    is_anonymous: boolean;
  }>;
  end_date?: string;
  remaining_days?: number;
}

export interface CreateDonationData {
  amount: number;
  order_id: string;
  mosque_id: string;
  anonymous: boolean;
  message?: string;
}

// Mock data
const mockDonations: DonationData[] = [
  {
    id: "1",
    title: "صيانة مكيفات المسجد",
    description: "تبرع لصيانة مكيفات المسجد استعداداً لفصل الصيف",
    target_amount: 50000,
    current_amount: 35000,
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    order_id: "1", // References the AC maintenance order
    image: "/assets/examples/ac-maintenance.jpg",
    donor_count: 125,
    priority: "urgent",
    recent_donors: [
      {
        name: "عبدالله محمد",
        amount: 1000,
        created_at: "2024-03-20T10:00:00Z",
        is_anonymous: false
      },
      {
        name: "متبرع كريم",
        amount: 500,
        created_at: "2024-03-20T09:30:00Z",
        is_anonymous: true
      }
    ],
    end_date: "2024-04-01T00:00:00Z",
    remaining_days: 10,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-20T00:00:00Z"
  },
  {
    id: "2",
    title: "تجديد سجاد المسجد",
    description: "تبرع لتجديد سجاد المسجد بالكامل",
    target_amount: 75000,
    current_amount: 45000,
    mosque: {
      id: "1",
      name: "مسجد ابو بكر الصديق"
    },
    order_id: "2", // References the carpet replacement order
    image: "/assets/examples/carpet-maintenance.jpg",
    donor_count: 89,
    priority: "regular",
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-20T00:00:00Z"
  }
];

class DonationService extends BaseService {
  constructor() {
    super('/donations');
  }

  async getDonations(params?: {
    mosque_id?: string;
    order_id?: string;
  }): Promise<ApiResponse<DonationData[]>> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredDonations = [...mockDonations];
          
          if (params?.mosque_id) {
            filteredDonations = filteredDonations.filter(
              donation => donation.mosque.id === params.mosque_id
            );
          }
          if (params?.order_id) {
            filteredDonations = filteredDonations.filter(
              donation => donation.order_id === params.order_id
            );
          }

          resolve({ data: filteredDonations, message: "Success", status: 200 });
        }, 500);
      });
    }

    const { data } = await this.api.get<ApiResponse<DonationData[]>>(
      this.endpoint,
      { params }
    );
    return data;
  }

  async createDonation(data: CreateDonationData): Promise<ApiResponse<void>> {
    // In development, simulate API call
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: undefined, message: "Success", status: 200 });
        }, 1000);
      });
    }

    const response = await this.api.post<ApiResponse<void>>(this.endpoint, data);
    return response.data;
  }
}

export const donationService = new DonationService(); 