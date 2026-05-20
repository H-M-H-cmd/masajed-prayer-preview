export type EventStatus = "draft" | "published" | "cancelled" | "completed";
import { Mosque } from "./mosque";


interface Attachment {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail?: string;
} 
export interface Event {
  id: string;
  title: string;
  type: "social" | "educational" | "announcement";
  start_at: string;
  end_at: string;
  mosque_id: string;
  mosque_name?: string;
  allow_comments: boolean;
  description: string;
  // status: "draft" | "published" | "cancelled" | "completed" | "upcoming" | "ongoing";
  status: string;
  created_at: string;
  updated_at: string;
  mosque?: Mosque;
  attachments: Attachment[];
}

export type EventRow = Pick<Event, 'id' | 'title' | 'mosque_name' | 'start_at' | 'end_at' | 'status'>;

export interface EventPaginatedResponse {
  data: Event[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export type CreateEventData = Omit<Event, "id" | "created_at" | "updated_at" | "mosque_name">;

export interface UpdateEventData extends Partial<CreateEventData> {}
