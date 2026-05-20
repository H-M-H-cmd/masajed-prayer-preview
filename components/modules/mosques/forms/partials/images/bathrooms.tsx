import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface BathroomImage {
  url: string;
  custom_properties?: {
    section?: string;
  };
}

interface BathroomsProps {
  images: Record<string, BathroomImage>;
  onImageUpload?: (section: string, file: File) => void;
  onImageDelete?: (section: string, imageUrl: string) => Promise<void>;
}

type BathroomSection = 
  | 'mens_exterior'
  | 'mens_ablution'
  | 'mens_toilets'
  | 'womens_bathrooms'
  | 'disabled_bathrooms';

const MAX_FILES = 5;

export const Bathrooms = ({ images, onImageUpload, onImageDelete }: BathroomsProps) => {
  const sections: { id: BathroomSection; label: string }[] = [
    { id: 'mens_exterior', label: 'صور حمام الرجال من الخارج' },
    { id: 'mens_ablution', label: 'صور مواضئ الرجال من الداخل' },
    { id: 'mens_toilets', label: 'صور لمكان قضاء الحاجه' },
    { id: 'womens_bathrooms', label: 'صور حمامات النساء' },
    { id: 'disabled_bathrooms', label: 'صور حمامات المعاقين' },
  ];

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUploadClick = (sectionId: string) => {
    fileInputRefs.current[sectionId]?.click();
  };

  const handleFileChange = (sectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload?.(sectionId, files[0]);
    }
    // Reset input value to allow uploading the same file again
    event.target.value = '';
  };

  const getSectionImages = (sectionId: string): BathroomImage[] => {
    return Object.entries(images)
      .filter(([, img]) => img.custom_properties?.section === sectionId)
      .map(([, img]) => img);
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const sectionImages = getSectionImages(section.id);
        const canAddMore = sectionImages.length < MAX_FILES;

        return (
          <div key={section.id} className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="text-lg font-semibold">
                {section.label}
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {sectionImages.map((image, index) => (
                <div 
                  key={`${section.id}-${index}`}
                  className="relative aspect-square group"
                >
                  <Image
                    src={image.url}
                    alt={`${section.label} ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onImageDelete?.(section.id, image.url)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {canAddMore && (
                <>
                  <input
                    type="file"
                    ref={(el) => {
                      if (el) {
                        fileInputRefs.current[section.id] = el;
                      }
                    }}
                    onChange={(e) => handleFileChange(section.id, e)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleUploadClick(section.id)}
                    className={cn(
                      "aspect-square rounded-lg border-2 border-dashed",
                      "flex items-center justify-center",
                      "hover:border-primary hover:bg-primary/5 transition-colors"
                    )}
                  >
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 