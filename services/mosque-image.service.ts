import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { ImageCollectionsResponse, MosqueImage, MosqueImageCollection } from '@/types/mosque-image';

class MosqueImageService extends BaseService {
  constructor() {
    super('/mosques');
  }

  async getImageCollections(): Promise<ImageCollectionsResponse> {
    const { data } = await this.api.get<ImageCollectionsResponse>(`${this.endpoint}/image-collections`);
    return data;
  }

  async getMosqueImages(mosqueId: string): Promise<ApiResponse<MosqueImage[]>> {
    const { data } = await this.api.get<ApiResponse<MosqueImage[]>>(`${this.endpoint}/${mosqueId}/images`);
    return data;
  }

  async uploadImages(mosqueId: string, collection: MosqueImageCollection): Promise<ApiResponse<MosqueImage[]>> {
    const formData = new FormData();
    
    formData.append('collection', collection.collection);
    collection.images.forEach((imageData, index) => {
      formData.append(`images[${index}][image]`, imageData.image);
      if (imageData.custom_properties) {
        formData.append(
          `images[${index}][custom_properties]`, 
          JSON.stringify(imageData.custom_properties)
        );
      }
    });

    const { data } = await this.api.post<ApiResponse<MosqueImage[]>>(
      `${this.endpoint}/${mosqueId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  async deleteImage(mosqueId: string, imageId: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${mosqueId}/images/${imageId}`);
    return data;
  }
}

export const mosqueImageService = new MosqueImageService(); 