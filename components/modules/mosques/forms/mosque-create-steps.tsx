"use client";

import * as React from "react";
import { MosqueForm } from "@/components/modules/mosques/forms/mosque-form";
import { MosqueImagesForm } from "@/components/modules/mosques/forms/mosque-images-form";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Building2, Images, Check, Users, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { MosqueFacilitiesForm } from "@/components/modules/mosques/forms/mosque-facilities-form";
import { mosqueImageService } from "@/services/mosque-image.service";
import { MosqueMembersForm } from "./mosque-members-form";
import { FacilityValue } from "@/types/facility";
import { Mosque, MosqueFormProps } from "@/types/mosque";
import { MosqueMember } from "@/types/mosque-member";
import { MosqueImage } from "@/types/mosque-image";
interface MosqueCreateStepsProps {
  mosque?: Mosque;
  defaultStep?: Step;
  isEditMode?: boolean;
}

type Step = 'details' | 'facilities' | 'images' | 'members';

const StepIcon = {
  details: Building2,
  facilities: LayoutGrid,
  images: Images,
  members: Users,
};

export function MosqueCreateSteps({ mosque, defaultStep, isEditMode = false }: MosqueCreateStepsProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = React.useState<Step>(defaultStep || 'details');
  const [mosqueId, setMosqueId] = React.useState<string | undefined>(mosque?.id);
  const [completedSteps, setCompletedSteps] = React.useState<Set<Step>>(new Set());
  const [currentMosque, setCurrentMosque] = React.useState<Mosque | undefined>(mosque);
  const [mosqueImages, setMosqueImages] = React.useState<MosqueImage[]>(mosque?.images || []);

  // Update stepsProgress state type
  const [stepsProgress, setStepsProgress] = React.useState<Record<Step, number>>(() => {
    // Calculate initial facilities progress if mosque exists
    let facilitiesProgress = 0;
    if (mosque?.facilities?.length) {
      facilitiesProgress = 100;
    }

    // Calculate initial images progress if mosque exists
    let imagesProgress = 0;
    if (mosque?.images?.length) {
      const collections = {
        exterior_images: mosque.images.some(img => img.collection_name === 'exterior_images'),
        interior_images: mosque.images.some(img => img.collection_name === 'interior_images'),
        gate_images: mosque.images.some(img => img.collection_name === 'gate_images')
      };
      
      const totalCollections = Object.keys(collections).length;
      const completedCollections = Object.values(collections).filter(Boolean).length;
      imagesProgress = Math.round((completedCollections / totalCollections) * 100);
    }

    // Calculate initial members progress with weighted roles
    let membersProgress = 0;
    if (mosque?.prayers?.length) {
      const roles = {
        imam: mosque.prayers.some(p => p.membership === 'imam'), // 50%
        muathen: mosque.prayers.some(p => p.membership === 'muathen'), // 30%
        nazir1: mosque.prayers.some(p => p.membership === 'nazir1'), // 20%
      };

      membersProgress = (
        (roles.imam ? 50 : 0) +
        (roles.muathen ? 30 : 0) +
        (roles.nazir1 ? 20 : 0)
      );
    }

    return {
      details: mosque ? 100 : 0,
      facilities: facilitiesProgress,
      images: imagesProgress,
      members: membersProgress
    };
  });

  // Update handleDetailsChange to properly track location fields
  const handleDetailsChange = React.useCallback((data: {
    name: string;
    type: string;
    related_to: string;
    location?: {
      lat: string | number;
      lng: string | number;
      region_id: string;
      city_id: string;
      district_id: string;
    };
  }) => {
    const requiredFields = {
      name: !!data.name,
      type: !!data.type,
      related_to: !!data.related_to,
      location_lat: !!data.location?.lat,
      location_lng: !!data.location?.lng,
      region_id: !!data.location?.region_id,
      city_id: !!data.location?.city_id,
      district_id: !!data.location?.district_id
    };
    
    const totalFields = Object.keys(requiredFields).length;
    const completedFields = Object.values(requiredFields).filter(Boolean).length;
    const progress = Math.round((completedFields / totalFields) * 100);

    setStepsProgress(prev => ({
      ...prev,
      details: progress
    }));

    // If all required fields are filled, mark the step as completed
    if (progress === 100) {
      setCompletedSteps(prev => new Set([...prev, 'details']));
    }
  }, []);

  // Handle facilities change for progress tracking
  const handleFacilitiesChange = (facilities: FacilityValue[]) => {
    // Calculate progress based on whether any facilities are selected
    const progress = facilities.length > 0 ? 100 : 0;
    
    setStepsProgress(prev => ({
      ...prev,
      facilities: progress
    }));
  };

  // Handle images change for progress tracking
  const handleImagesChange = React.useCallback((images: MosqueImage[]) => {
    // Group images by collection
    const imagesByCollection = images.reduce((acc, img) => {
      const collection = img.collection_name;
      if (!acc[collection]) {
        acc[collection] = [];
      }
      acc[collection].push(img);
      return acc;
    }, {} as Record<string, MosqueImage[]>);

    // Required collections and their status
    const collections = {
      exterior_images: imagesByCollection['exterior_images']?.length > 0,
      interior_images: imagesByCollection['interior_images']?.length > 0,
      gate_images: imagesByCollection['gate_images']?.length > 0
    };

    // Calculate progress based on completed collections
    const totalCollections = Object.keys(collections).length;
    const completedCollections = Object.values(collections).filter(Boolean).length;
    const progress = Math.round((completedCollections / totalCollections) * 100);

    // Update progress state
    setStepsProgress(prev => ({
      ...prev,
      images: progress
    }));

    // Update mosque images state
    setMosqueImages(images);
  }, []);

  // Add handleMembersChange function
  const handleMembersChange = React.useCallback((members: MosqueMember[]) => {
    const roles = {
      imam: members.some(p => p.membership === 'imam'),
      muathen: members.some(p => p.membership === 'muathen'),
      nazir1: members.some(p => p.membership === 'nazir1'),
    };

    const membersProgress = (
      (roles.imam ? 50 : 0) +
      (roles.muathen ? 30 : 0) +
      (roles.nazir1 ? 20 : 0)
    );

    setStepsProgress(prev => ({
      ...prev,
      members: membersProgress
    }));

    if (membersProgress === 100) {
      setCompletedSteps(prev => new Set([...prev, 'members']));
    }
  }, []);

  // Update calculateCompletionPercentage
  const calculateCompletionPercentage = React.useMemo(() => {
    const weights = {
      details: 0.4,    // 40% - Most important step
      facilities: 0.2, // 20%
      images: 0.3,     // 30%
      members: 0.1     // 10% - Members step
    };

    return Math.round(
      Object.entries(weights).reduce((acc, [step, weight]) => {
        return acc + (stepsProgress[step as Step] * weight);
      }, 0)
    );
  }, [stepsProgress]);

  // Update handleMosqueCreated to handle the new response format
  const handleMosqueCreated = async (newMosqueId: string, data: Mosque) => {
    setMosqueId(newMosqueId);
    
    // Update progress for details
    handleDetailsChange({
      name: data.name,
      type: data.type,
      related_to: data.related_to,
      location: {
        lat: data.location?.lat.toString() || '',
        lng: data.location?.lng.toString() || '',
        region_id: data.location?.region?.id.toString() || '',
        city_id: data.location?.city?.id.toString() || '',
        district_id: data.location?.district?.id.toString() || ''
      }
    });

    // Set current mosque with the new data
    setCurrentMosque(data);

    if (!isEditMode) {
      toast.success(t('mosques.create.success'));
      router.push(`/dashboard/mosques/${newMosqueId}/edit?step=facilities`);
    } else {
      toast.success(t('mosques.edit.success'));
      setCurrentStep('facilities');
    }
  };

  const handleStepClick = (step: Step) => {
    // Only allow clicking if step is available
    if (!isStepAvailable(step)) {
      toast.error(t('common.error'), {
        description: t('mosques.form.completeLocationFirst')
      });
      return;
    }
    setCurrentStep(step);
  };

  const steps: Step[] = ['details', 'facilities', 'images', 'members'];

  const isStepCompleted = (step: Step): boolean => {
    if (completedSteps.has(step)) return true;
    if (!currentMosque) return false;
    
    switch (step) {
      case 'details':
        return true; // Always completed if mosque exists
      case 'facilities':
        return (currentMosque.facilities?.length || 0) > 0; // Check for facilities
      case 'images':
        return (currentMosque.images?.length || 0) > 0;
      case 'members':
        return (currentMosque.prayers?.length || 0) > 0;
      default:
        return false;
    }
  };

  const isStepAvailable = (step: Step): boolean => {
    switch (step) {
      case 'details':
        return true;
      case 'facilities':
        return !!mosqueId && stepsProgress.details === 100;
      case 'images':
        return !!mosqueId && stepsProgress.facilities === 100;
      case 'members':
        return !!mosqueId && stepsProgress.images === 100;
      default:
        return false;
    }
  };

  // Add effect to fetch mosque images when in edit mode
  React.useEffect(() => {
    const fetchMosqueImages = async () => {
      if (isEditMode && mosque?.id && !mosque.images) {
        try {
          const response = await mosqueImageService.getMosqueImages(mosque.id);
          setMosqueImages(response.data);

          // Calculate progress based on fetched data
          const collections = {
            exterior_images: response.data.some(img => img.collection_name === 'exterior_images'),
            interior_images: response.data.some(img => img.collection_name === 'interior_images'),
            gate_images: response.data.some(img => img.collection_name === 'gate_images')
          };
          
          const totalCollections = Object.keys(collections).length;
          const completedCollections = Object.values(collections).filter(Boolean).length;
          const progress = Math.round((completedCollections / totalCollections) * 100);

          setStepsProgress(prev => ({
            ...prev,
            images: progress
          }));

          if (progress === 100) {
            setCompletedSteps(prev => new Set([...prev, 'images']));
          }
        } catch (error) {
          toast.error(t('common.error'), {
            description: (error as Error).message || t('mosques.form.imagesFetchError')
          });
        }
      }
    };

    fetchMosqueImages();
  }, [isEditMode, mosque?.id, mosque?.images, t]);

  return (
    <div className="max-w-8xl mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {/* Side Stepper */}
        <Card className="h-fit sticky top-8 p-6 md:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {t(isEditMode ? 'mosques.edit.title' : 'mosques.create.title')}
            </h2>
            
            {/* Overall Progress using AnimatedCircularProgressBar */}
            <div className="relative h-8 w-8">
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={calculateCompletionPercentage}
                gaugePrimaryColor="hsl(var(--primary))"
                gaugeSecondaryColor="hsl(var(--muted))"
                className="h-8 w-8 text-xs"
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-8">
            {/* Vertical Progress line */}
            <div className={cn(
              "absolute top-5 h-[calc(100%-40px)] w-[2px]",
              language === 'ar' ? "right-5" : "left-5"
            )}>
              <div className="relative w-full h-full bg-muted">
                <div 
                  className="absolute top-0 w-full bg-primary transition-all duration-300"
                  style={{ 
                    height: `${(steps.indexOf(currentStep) / (steps.length - 1)) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Steps */}
            {steps.map((step) => {
              const Icon = StepIcon[step];
              const isActive = currentStep === step;
              const isCompleted = isStepCompleted(step);
              const isAvailable = isStepAvailable(step);
              const stepProgress = stepsProgress[step];
              
              return (
                <div
                  key={step}
                  className={cn(
                    "relative",
                    isActive && "text-primary",
                    isCompleted && "text-primary",
                    !isAvailable && "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-4 cursor-pointer hover:text-primary transition-colors",
                      !isAvailable && "cursor-not-allowed"
                    )}
                    onClick={() => isAvailable && handleStepClick(step)}
                    role="button"
                    tabIndex={isAvailable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (isAvailable && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleStepClick(step);
                      }
                    }}
                  >
                    <div className={cn(
                      "relative z-10 flex items-center justify-center shrink-0",
                      "w-10 h-10 rounded-full border-2 transition-colors duration-300",
                      "bg-background",
                      isActive && "border-primary ring-2 ring-primary/20",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-muted"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-4 pt-1.5">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary"
                        )}>
                          {t(`mosques.create.steps.${step}`)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      {(isActive || stepProgress > 0) && (
                        <div className="w-16 flex items-center self-start mt-1.5">
                          <div className={cn(
                            "w-full relative",
                            "transition-all duration-500 ease-in-out", // Increased duration for smoother height transition
                          )}>
                            <AnimatePresence mode="wait">
                              {stepProgress === 100 ? (
                                <motion.div
                                  className="flex items-center justify-center"
                                  key="check"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.4, 0, 0.2, 1]
                                  }}
                                  // className="absolute inset-0"
                                >
                                  <Check className="w-5 h-5 text-primary animate-check-pop" strokeWidth={2.5} />
                                </motion.div>
                              ) : (
                                <motion.div
                                  className="flex items-center justify-center"
                                  key="progress"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.4, 0, 0.2, 1]
                                  }}
                                >
                                  <Progress
                                    max={100}
                                    value={stepProgress}
                                    className="h-1.5 transition-all duration-300"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Main Content */}
        <Card className="flex-1 p-6 md:col-span-2 lg:col-span-4">
          {currentStep === 'details' && (
            <MosqueForm 
              mosque={currentMosque} 
              onMosqueCreated={(mosqueId, data) => handleMosqueCreated(mosqueId, data as Mosque)}
              onChange={handleDetailsChange as MosqueFormProps['onChange']}
            />
          )}

          {currentStep === 'facilities' && mosqueId && (
            <MosqueFacilitiesForm 
              mosque={currentMosque}
              onFacilitiesUpdated={(facilities) => {
                if (facilities.length > 0) {
                  setCompletedSteps(prev => new Set([...prev, 'facilities']));
                  setStepsProgress(prev => ({
                    ...prev,
                    facilities: 100
                  }));
                  setCurrentStep('images');
                } else {
                  toast.error(t('common.error'), {
                    description: t('mosques.form.facilitiesRequired')
                  });
                }
              }}
              onChange={(facilities) => {
                handleFacilitiesChange(facilities);
                if (facilities.length > 0) {
                  setCompletedSteps(prev => new Set([...prev, 'facilities']));
                }
              }}
            />
          )}

          {currentStep === 'images' && mosqueId && (
            <MosqueImagesForm 
              mosqueId={mosqueId}
              existingImages={mosqueImages}
              onChange={handleImagesChange}
              onFacilitiesUpdated={() => {
                setCurrentStep('members');
                setCompletedSteps(prev => new Set([...prev, 'images']));
              }}
            />
          )}

          {currentStep === 'members' && mosqueId && (
            <MosqueMembersForm
              mosque={currentMosque as unknown as Mosque}
              onMembersUpdated={() => {
                setCompletedSteps(prev => new Set([...prev, 'members']));
                router.push("/dashboard/mosques");
              }}
              onChange={handleMembersChange}
            />
          )}
        </Card>
      </div>
    </div>
  );
} 