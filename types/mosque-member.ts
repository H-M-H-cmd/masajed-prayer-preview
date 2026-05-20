import { LucideIcon } from "lucide-react";
import { Member } from "@/components/modules/members/schema";
import { z } from "zod";

export type MembershipType = 'imam' | 'muathen' | 'nazir1' | 'nazir2' | 'volunteer' | 'permanent_volunteer';

export const memberFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t('common.required')),
  phone: z.string().regex(/^\+966\d{9}$/, t('auth.phoneFormat')),
  id_number: z.string()
    .min(10, t('auth.verification.idNumberLength'))
    .max(10, t('auth.verification.idNumberLength'))
    .regex(/^[0-9]+$/, t('auth.verification.idNumberFormat'))
    .refine((value) => {
      return value.startsWith('1') || value.startsWith('2');
    }, t('auth.verification.idNumberStart')),
  membership: z.enum(['imam', 'muathen', 'nazir1', 'nazir2', 'volunteer', 'permanent_volunteer'] as const),
});


export interface MosqueMenuItem {
  id: string;
  icon: LucideIcon;
  translationKey: string;
  is_active: boolean;
}

export interface CreateMosqueMemberData {
  name: string;
  id_number?: string | number | null;
  phone: string;
  gender?: 'male' | 'female';
  mosque_id?: string|number;
  membership?: MembershipType;
  is_active: boolean;
}
export interface MosqueMember {
  id: string;
  name: string;
  id_number: string | number | null;
  phone: string;
  gender?: 'male' | 'female';
  group?: string;
  birthday?: string;
  mosque_id?: string;
  membership?: MembershipType;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type MemberFormValues = z.infer<ReturnType<typeof memberFormSchema>>;


export interface MemberPaginationMeta {
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

export interface MemberPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface MemberPaginatedResponse {
  message: string;
  data: {
    data: Member[];
    links: MemberPaginationLinks;
    meta: MemberPaginationMeta;
  };
}