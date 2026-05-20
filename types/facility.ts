import { Mosque } from '@/types/mosque';
import { PaginatedResponse, PaginationLinks, PaginationMeta } from '@/types/api';

export interface FacilityMetadata {
  type: string;
  field_name: string;
  field_name_ar: string;
}

export interface Facility {
  id: string;
  name: string;
  name_ar: string;
  group: string;
  group_ar: string;
  type: 'service' | 'facility';
  pivot?: {
    value: string | null;
  };
  metadata: FacilityMetadata | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface FacilityValue {
  id: string;
  value?: number | null;
}

export interface FacilityGroup {
  name: string;
  name_ar: string;
  facilities: Facility[];
}

export interface FacilityFormData {
  facility_id: string;
  enabled: boolean;
  value?: string;
}



export interface FacilityPaginatedResponse extends PaginatedResponse<Facility> {
  data: {
    data: Facility[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  };
}

export interface MosqueFacilitiesFormProps {
  mosque?: Mosque;
  onFacilitiesUpdated?: (facilities: FacilityValue[]) => void;
  onChange?: (facilities: FacilityValue[]) => void;
}