import { z } from "zod";
import { Event } from "@/types/event";


export type EventRow = Pick<Event, 'id' | 'title' | 'mosque_name' | 'start_at' | 'end_at' | 'status'>;

const eventBaseSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  type: z.enum(["social", "educational", "announcement"], {
    required_error: "Type is required",
  }),
  start_at: z.string({
    required_error: "Start date is required",
  }).datetime("Invalid start date"),
  end_at: z.string({
    required_error: "End date is required",
  }).datetime("Invalid end date"),
  mosque_id: z.string({
    required_error: "Mosque is required",
  }),
  allow_comments: z.boolean().default(false),
  description: z.string({
    required_error: "Description is required",
  }),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
  attachments: z.array(z.any()).optional(),
});

export const eventSchema = eventBaseSchema.refine((data) => {
  if (data.start_at && data.end_at) {
    return new Date(data.end_at) > new Date(data.start_at);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_at"],
});

export const updateEventSchema = eventBaseSchema.partial();
