export interface Rating {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number; // 1-5
  comment: string;
  created_at: string;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  reply?: {
    user: {
      name: string;
      role: string;
    };
    comment: string;
    created_at: string;
  };
}

export interface CreateRatingData {
  mosque_id: string;
  rating: number;
  comment: string;
} 