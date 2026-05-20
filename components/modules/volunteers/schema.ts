import * as z from "zod";

const volunteerBaseSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  type: z.enum(["volunteer", "training"], {
    required_error: "Type is required",
  }),
  start_at: z.string({
    required_error: "Start date is required",
  }).datetime("Invalid start date"),
  end_at: z.string({
    required_error: "End date is required",
  }).datetime("Invalid end date"),
  gender: z.enum(["male", "female", "all"], {
    required_error: "Gender is required",
  }),
  age_from: z.number().min(1).nullable().optional(),
  age_to: z.number().min(1).nullable().optional(),
  description: z.string()
  .min(5, "Description is required and must be at least 5 characters")
  .max(1024, "Description must be less than 1024 characters"),
  requirements: z.string().optional(),
  skills: z.array(z.string()).optional(),
  has_financial_reward: z.boolean().default(false),
  reward_amount: z.number().min(0).nullable().optional(),
  has_certificate_reward: z.boolean().default(false),
  has_hours_reward: z.boolean().default(false),
  volunteer_hours: z.number().min(1).nullable().optional(),
  has_training: z.boolean().default(false),
  capacity: z.number().min(1).nullable().optional(),
  status: z.enum(["draft", "open", "closed", "cancelled", "completed"]).default("draft"),
  application_deadline: z.string({
    required_error: "Application deadline is required",
  }).datetime("Invalid application deadline"),
  supervisor_id: z.string().optional(),
  mosques: z.array(z.string()).optional(),
  mosque_id: z.string().optional(),
});

export const volunteerSchema = volunteerBaseSchema.refine((data) => {
  if (data.start_at && data.end_at) {
    return new Date(data.end_at) > new Date(data.start_at);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_at"],
}).refine((data) => {
  if (data.age_from !== null && data.age_from !== undefined && data.age_to !== null && data.age_to !== undefined) {
    return data.age_to >= data.age_from;
  }
  return true;
}, {
  message: "Age to must be greater than or equal to age from",
  path: ["age_to"],
}).refine((data) => {
  if (data.start_at && data.application_deadline) {
    return new Date(data.application_deadline) < new Date(data.start_at);
  }
  return true;
}, {
  message: "Application deadline must be before start date",
  path: ["application_deadline"],
});

export const updateVolunteerSchema = volunteerBaseSchema.partial().refine((data) => {
  if (data.start_at && data.end_at) {
    return new Date(data.end_at) > new Date(data.start_at);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_at"],
}).refine((data) => {
  if (data.age_from !== null && data.age_from !== undefined && data.age_to !== null && data.age_to !== undefined) {
    return data.age_to >= data.age_from;
  }
  return true;
}, {
  message: "Age to must be greater than or equal to age from",
  path: ["age_to"],
}).refine((data) => {
  if (data.start_at && data.application_deadline) {
    return new Date(data.application_deadline) > new Date(data.start_at);
  }
  return true;
}, {
  message: "Application deadline must be after start date",
  path: ["application_deadline"],
});

export type VolunteerFormValues = z.infer<typeof volunteerSchema>;

