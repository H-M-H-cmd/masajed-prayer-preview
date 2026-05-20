import { z } from "zod"

export const memberSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  name: z.string(),
  phone: z.string(),
  id_number: z.string(),
  group: z.enum(["admin", "member"]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
})

export type Member = z.infer<typeof memberSchema>
export type MemberRow = Omit<Member, 'organization_id'> 