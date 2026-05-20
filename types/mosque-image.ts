
export interface ImageCollection {
    value: string;
    label: string;
}

export interface ImageCollectionsResponse {
    message: string;
    data: ImageCollection[];
}

export interface MosqueImage {
    id: string;
    model_type: string;
    model_id: string;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    manipulations: any[];
    custom_properties?: Record<string, any>;
    generated_conversions: any[];
    responsive_images: any[];
    order_column: number;
    created_at: string;
    updated_at: string;
    original_url: string;
    preview_url: string;
}

export interface MosqueImageWithProperties {
    image: File;
    custom_properties?: Record<string, any>;
}

export interface MosqueImageCollection {
    collection: string;
    images: MosqueImageWithProperties[];
}
export interface MosqueImageData {
    collection: string;
    image: File;
}

export interface MosqueImageUploadResponse {
    collection: string;
    url: string;
}
