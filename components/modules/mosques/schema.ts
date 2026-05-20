import { z } from "zod"

export const mosqueSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  type: z.enum(["jamee", "masjed", "mosala", "temporary", "other"]),
  related_to: z.enum(["awqaf", "charity", "private"]),
  organization_id: z.string(),
  capacity: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export type Mosque = z.infer<typeof mosqueSchema>
export type MosqueRow = Pick<Mosque, 'id' | 'name' | 'type' | 'related_to'>