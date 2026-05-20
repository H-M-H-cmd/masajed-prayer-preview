"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { MosqueFacilitiesForm } from "@/components/modules/mosques/forms/mosque-facilities-form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mosqueService } from "@/services/mosque.service";
import { useApi } from "@/hooks/use-api";
import { Mosque } from "@/types/mosque";
import { Facility, FacilityValue } from "@/types/facility";

interface FacilitiesTabProps {
  mosqueId: string;
}

export function FacilitiesTab({ mosqueId }: FacilitiesTabProps) {
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

  const handleFacilitiesUpdated = (facilities: FacilityValue[]) => {
    if (!mosque) return;

    // Keep existing facility data and update only the values
    const updatedFacilities: Facility[] = mosque.facilities?.map(facility => {
      const updatedFacility = facilities.find(f => f.id === facility.id);
      if (updatedFacility) {
        return {
          ...facility,
          pivot: { 
            value: updatedFacility.value?.toString() ?? null 
          }
        };
      }
      return facility;
    }) || [];

    setMosque({
      ...mosque,
      facilities: updatedFacilities
    });

    toast({
      title: t('mosques.facilities.updateSuccess'),
      description: t('common.success')
    });
    router.refresh();
  };

  const handleFacilitiesChange = (facilities: FacilityValue[]) => {
    if (!mosque) return;

    // Keep existing facility data and update only the values
    const updatedFacilities: Facility[] = mosque.facilities?.map(facility => {
      const updatedFacility = facilities.find(f => f.id === facility.id);
      if (updatedFacility) {
        return {
          ...facility,
          pivot: { 
            value: updatedFacility.value?.toString() ?? null 
          }
        };
      }
      return facility;
    }) || [];

    setMosque({
      ...mosque,
      facilities: updatedFacilities
    });
  };

  if (!mosque) {
    return null; // Or loading state
  }

  return (
    <div className="p-4">
      <div className="space-y-6">
        <MosqueFacilitiesForm
          mosque={mosque}
          onFacilitiesUpdated={handleFacilitiesUpdated}
          onChange={handleFacilitiesChange}
          hideCancelButton={true}
        />
      </div>
    </div>
  );
} 