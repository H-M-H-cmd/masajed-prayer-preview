import { Mosque } from "./mosque";

export interface VolunteerOpportunity {
  id: string;
  title: string;
  type: string;
  start_at: string; // Changed from Date to string
  end_at: string; // Changed from Date to string
  gender: 'male' | 'female' | 'both';
  age_from: number;
  age_to: number;
  description: string;
  requirements: string;
  skills: string[];
  has_financial_reward: boolean;
  reward_amount: number | null;
  has_certificate_reward: boolean;
  has_hours_reward: boolean;
  volunteer_hours: number | null;
  has_training: boolean;
  capacity: number;
  status: 'draft' | 'open' | 'closed' | 'cancelled' | 'completed'
  application_deadline: string;
  mosques: Mosque[];
  mosque_name: string;
  created_at: string;
  updated_at: string;
  mosque_id: string;
  attachments?: {
    url: string;
    file_name: string;
  }[];
}

export interface VolunteerOpportunityRow extends Omit<VolunteerOpportunity, 'mosques'> {
  mosque_name: string;
}

export interface VolunteerPaginatedResponse {
  data: VolunteerOpportunity[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
} 

export interface CreateVolunteerData {
  title: string;
  type: string;
  start_at: string; // Changed from Date to string
  end_at: string; // Changed from Date to string
}