"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { MosqueForm } from "@/components/modules/mosques/forms/mosque-form";
import { Mosque, CreateMosqueData } from "@/types/mosque";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mosqueService } from "@/services/mosque.service";
import { useApi } from "@/hooks/use-api";
import { Location } from "@/types/location";

interface BasicInfoTabProps {
  mosqueId: string;
}

type MosqueFormChangeData = {
  name: string;
  type: string;
  related_to: string;
  location?: Location;
};

export function BasicInfoTab({ mosqueId }: BasicInfoTabProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [mosque, setMosque] = React.useState<Mosque | undefined>();

  // Fetch mosque data
  const { execute: fetchMosque } = useApi(
    () => mosqueService.getMosque(mosqueId),
    {
      onSuccess: (response) => {
        setMosque(response.data);
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

  // Handle mosque update
  const handleMosqueUpdated = (id: string, data: CreateMosqueData) => {
    if (!mosque) return;

    // Create a new mosque object with updated data
    const updatedMosque: Mosque = {
      ...mosque,
      name: data.name,
      type: data.type as Mosque['type'],
      related_to: data.related_to as Mosque['related_to'],
      location: data.location,
    };
    
    setMosque(updatedMosque);
    toast({
      title: t('mosques.edit.success'),
      description: t('common.success')
    });
    router.refresh();
  };

  // Handle form changes
  const handleFormChange = (data: MosqueFormChangeData) => {
    if (!mosque) return;

    const updatedMosque: Mosque = {
      ...mosque,
      name: data.name,
      type: data.type as Mosque['type'],
      related_to: data.related_to as Mosque['related_to'],
      location: data.location,
    };

    setMosque(updatedMosque);
  };

  if (!mosque) {
    return null; // Or loading state
  }

  return (
    <div className="p-4">
      <div className="space-y-6">
        <MosqueForm
          mosque={mosque}
          onMosqueCreated={handleMosqueUpdated}
          onChange={handleFormChange}
          hideCancelButton={true}
        />
      </div>
    </div>
  );
} 