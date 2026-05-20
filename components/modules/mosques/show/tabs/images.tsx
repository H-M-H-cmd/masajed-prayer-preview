"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { MosqueImagesForm } from "@/components/modules/mosques/forms/mosque-images-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mosqueService } from "@/services/mosque.service";
import { useApi } from "@/hooks/use-api";
import { Mosque } from "@/types/mosque";
import { MosqueImage } from "@/types/mosque-image";

interface ImagesTabProps {
  mosqueId: string;
}

export function ImagesTab({ mosqueId }: ImagesTabProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [mosque, setMosque] = React.useState<Mosque | undefined>();
  const [images, setImages] = React.useState<MosqueImage[]>([]);

  // Fetch mosque data
  const { execute: fetchMosque } = useApi(
    () => mosqueService.getMosque(mosqueId),
    {
      onSuccess: (response) => {
        setMosque(response.data);
        setImages(response.data.images || []);
      },
      onError: (error) => {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  React.useEffect(() => {
    void fetchMosque();
  }, []);

  const handleImagesUpdated = () => {
    if (!mosque) return;

    // Update mosque with current images
    setMosque({
      ...mosque,
      images
    });

    toast({
      title: t('mosques.images.updateSuccess'),
      description: t('common.success')
    });
    router.refresh();
  };

  const handleImagesChange = (newImages: MosqueImage[]) => {
    setImages(newImages);
  };

  if (!mosque) {
    return null; // Or loading state
  }

  return (
    <div className="p-4">
      <div className="space-y-6">
        <MosqueImagesForm
          mosqueId={mosqueId}
          existingImages={images}
          onChange={handleImagesChange}
          onFacilitiesUpdated={handleImagesUpdated}
          hideCancelButton={true}
        />
      </div>
    </div>
  );
} 