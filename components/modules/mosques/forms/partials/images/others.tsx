import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtherImage {
  url: string;
  custom_properties?: {
    section?: string;
  };
}

interface OthersProps {
  images: Record<string, OtherImage>;
  onImageUpload?: (section: string, file: File) => void;
  onImageDelete?: (section: string, imageUrl: string) => Promise<void>;
}

type OtherSection = 
  | 'disabled_parking'
  | 'commercial_facilities'
  | 'outdoor_prayer'
  | 'garden'
  | 'mortuary';

const MAX_FILES = 5;

export const Others = ({ images, onImageUpload, onImageDelete }: OthersProps) => {
  const sections: { id: OtherSection; label: string }[] = [
    { id: 'disabled_parking', label: 'موقف المعاقين' },
    { id: 'commercial_facilities', label: 'المرافق التجاريه' },
    { id: 'outdoor_prayer', label: 'ساحات الصلاه الخارجيه' },
    { id: 'garden', label: 'الحديقه' },
    { id: 'mortuary', label: 'مغسلة الموتى' },
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

  const getSectionImages = (sectionId: string): OtherImage[] => {
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