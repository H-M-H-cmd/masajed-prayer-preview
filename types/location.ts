export interface Region {
    id: number | string;
    name: string;
    name_ar: string;
    code: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface City {
    id: number | string;
    name: string;
    name_ar: string;
    is_active: number;
    region_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface District {
    id: number | string;
    name: string;
    name_ar: string;
    is_active: number;
    city_id: number | string    ;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: number | string;
    lat: number | string;
    lng: number | string;
    name?: string;
    address_1?: string;
    address_2?: string;
    region?: Region;
    city?: City;
    district?: District;
    region_id?: number | string;
    city_id?: number | string;
    district_id?: number | string;
    created_at: string;
    updated_at: string;
}

export interface CreateLocationData {
    lat: number | string;
    lng: number | string;
    district_id?: number | string;
    city_id?: number | string;
    region_id?: number | string;
}

export interface RegionPaginationMeta {
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

export interface RegionPaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface RegionPaginatedResponse {
    message: string;
    data: {
        data: Region[];
        links: RegionPaginationLinks;
        meta: RegionPaginationMeta;
    };
}

export interface CityPaginatedResponse {
    message: string;
    data: {
        data: City[];
        links: RegionPaginationLinks;
        meta: RegionPaginationMeta;
    };
}

export interface DistrictPaginatedResponse {
    message: string;
    data: {
        data: District[];
        links: RegionPaginationLinks;
        meta: RegionPaginationMeta;
    };
}