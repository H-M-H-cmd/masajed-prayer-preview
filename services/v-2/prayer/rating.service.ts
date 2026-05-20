import { BaseService } from '../../base.service';
import { ApiResponse } from '@/types/api';
import { Rating, CreateRatingData } from '@/types/rating';

// Generate more mock data
const generateMockRatings = (count: number): Rating[] => {
  const ratings: Rating[] = [];
  const names = [
    "عبدالله محمد", "محمد السالم", "فهد العتيبي", "خالد الغامدي", 
    "سعد الحربي", "عمر القحطاني", "ناصر الدوسري", "بندر السهلي",
    "عبدالرحمن العمري", "يوسف الشهري", "إبراهيم الزهراني", "سلطان المالكي"
  ];
  const comments = [
    "مسجد نظيف ومرتب، والإمام صوته جميل وخاشع. المكيفات تعمل بشكل ممتاز والمواقف متوفرة",
    "المسجد جميل ونظيف، لكن المواقف قليلة في أوقات الذروة",
    "من أجمل المساجد في الحي، نظافة ممتازة وتهوية جيدة",
    "المسجد بحاجة لصيانة المكيفات، الجو حار في الصيف",
    "موقع ممتاز وسهل الوصول إليه. النظافة ممتازة",
    "الإمام صوته جميل وخاشع. مواقف كافية",
    "المسجد واسع ومريح. التكييف ممتاز",
    "نظافة المسجد ممتازة والعاملين متعاونين",
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

    ratings.push({
      id: (i + 1).toString(),
      user: {
        name: names[Math.floor(Math.random() * names.length)],
        avatar: Math.random() > 0.5 ? `/assets/avatars/avatar-${(i % 5) + 1}.png` : undefined
      },
      rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
      comment: comments[Math.floor(Math.random() * comments.length)],
      created_at: date.toISOString(),
      helpful_count: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'pending' : 'approved' // 30% pending, 70% approved
    });
  }

  return ratings;
};

const mockRatings = generateMockRatings(50); // Generate 50 mock ratings

class RatingService extends BaseService {
  constructor() {
    super('/ratings');
  }

  async getRatings(
    mosque_id: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
      status?: 'pending' | 'approved' | 'all';
    }
  ): Promise<ApiResponse<{ data: Rating[]; total: number; }>> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          const page = params?.page || 1;
          const limit = params?.limit || 10;
          const status = params?.status || 'all';
          
          let filteredRatings = [...mockRatings];
          
          // Filter by status if specified
          if (status !== 'all') {
            filteredRatings = filteredRatings.filter(r => r.status === status);
          }

          // Sort if specified
          if (params?.sort) {
            filteredRatings.sort((a, b) => {
              switch (params.sort) {
                case 'highest':
                  return b.rating - a.rating;
                case 'lowest':
                  return a.rating - b.rating;
                case 'newest':
                default:
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              }
            });
          }

          // Paginate
          const start = (page - 1) * limit;
          const paginatedData = filteredRatings.slice(start, start + limit);

          resolve({ 
            data: {
              data: paginatedData,
              total: filteredRatings.length
            },
            message: "Success", 
            status: 200 
          });
        }, 500);
      });
    }

    const { data } = await this.api.get<ApiResponse<{ data: Rating[]; total: number; }>>(
      `${this.endpoint}/${mosque_id}`,
      { params }
    );
    return data;
  }

  async createRating(data: CreateRatingData): Promise<ApiResponse<void>> {
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

  async approveRating(ratingId: string): Promise<ApiResponse<void>> {
    // In development, simulate API call
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Update the mock data
          const ratingIndex = mockRatings.findIndex(r => r.id === ratingId);
          if (ratingIndex !== -1) {
            mockRatings[ratingIndex].status = 'approved';
          }
          resolve({ data: undefined, message: "Rating approved successfully", status: 200 });
        }, 500);
      });
    }

    const response = await this.api.put<ApiResponse<void>>(
      `${this.endpoint}/${ratingId}/approve`
    );
    return response.data;
  }

  async rejectRating(ratingId: string): Promise<ApiResponse<void>> {
    // In development, simulate API call
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Update the mock data
          const ratingIndex = mockRatings.findIndex(r => r.id === ratingId);
          if (ratingIndex !== -1) {
            mockRatings[ratingIndex].status = 'rejected';
          }
          resolve({ data: undefined, message: "Rating rejected successfully", status: 200 });
        }, 500);
      });
    }

    const response = await this.api.put<ApiResponse<void>>(
      `${this.endpoint}/${ratingId}/reject`
    );
    return response.data;
  }
}

export const ratingService = new RatingService(); 