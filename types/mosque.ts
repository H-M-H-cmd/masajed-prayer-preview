import { Asset } from "@/services/asset.service";
import { Facility } from "./facility";
import { PaginatedResponse, PaginationLinks, PaginationMeta } from "./api";
import { MosqueImage } from "@/types/mosque-image";
import { MosqueMember } from "@/types/mosque-member";
import { Location } from "./location";

export interface Mosque {
    id: string;
    name: string;
    type: 'jamee' | 'masjed' | 'mosala' | 'temporary' | 'other';
    related_to: 'moia' | 'awqaf' | 'private';
    suffix?: string;
    nickname?: string;
    water_source?: string;
    electricity_source?: string;
    length?: string;
    width?: string;
    rows_count?: string;
    organization_id: string;
    location_id?: string;
    location?: Location;
    assets?: Asset[];
    facilities?: Facility[];
    images?: MosqueImage[];
    code: string;
    created_at: string;
    updated_at: string;
    prayers?: MosqueMember[];
}

export interface CreateMosqueData {
    name: string;
    type: 'jamee' | 'masjed' | 'mosala' | 'temporary' | 'other';
    related_to: 'moia' | 'awqaf' | 'private';
    suffix?: string;
    nickname?: string;
    water_source?: string;
    electricity_source?: string;
    length?: string;
    width?: string;
    rows_count?: string;
    location?: Location;
    location_id?: string;
    assets?: string[];
    facilities?: string[];
}

export interface MosqueFormProps {
    mosque?: Mosque;
    onMosqueCreated?: (mosqueId: string, data: CreateMosqueData) => void;
    onChange?: (data: {
      name: string;
      type: string;
      related_to: string;
      location?: Location;
    }) => void;
  }
  

export interface MosqueImageData {
    collection: string;
    image: File;
}

export interface MosquePaginatedResponse extends PaginatedResponse<Mosque> {
    data: {
        data: Mosque[];
        meta?: PaginationMeta;
        links?: PaginationLinks;
    };
}