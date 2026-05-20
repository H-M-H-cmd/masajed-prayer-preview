"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { mosqueService } from "@/services/mosque.service";
import { Mosque, CreateMosqueData } from "@/types/mosque"
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/api";
import { useLanguage } from "@/providers/language-provider";
import { Loader2 } from "lucide-react";
import { MapPicker } from "@/components/ui/map-picker";
import { locationService } from "@/services/location.service";
import { Region, City, District, Location } from "@/types/location";
import { MosqueFormProps } from "@/types/mosque";
import { QRCode } from "@/components/ui/qr-code";

const mosqueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  suffix: z.string().optional(),
  nickname: z.string().optional(),
  type: z.enum(['jamee', 'masjed', 'mosala', 'temporary', 'other'] as const),
  related_to: z.enum(['moia', 'awqaf', 'private'] as const),
  location: z.object({
    region_id: z.string().min(1, "Region is required"),
    city_id: z.string().min(1, "City is required"),
    district_id: z.string().min(1, "District is required"),
    lat: z.string().min(1, "Location on map is required"),
    lng: z.string().min(1, "Location on map is required")
  })
});


// Add a RequiredLabel component
const RequiredLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-destructive">*</span>
  </div>
);
interface ExtendedMosqueFormProps extends MosqueFormProps {
  hideCancelButton?: boolean;
}

export function MosqueForm({ mosque, onMosqueCreated, onChange, hideCancelButton = false }: ExtendedMosqueFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Remove unused loading states, keep only the data states
  const [loadedRegions, setLoadedRegions] = React.useState<Region[]>([]);
  const [loadedCities, setLoadedCities] = React.useState<City[]>([]);
  const [loadedDistricts, setLoadedDistricts] = React.useState<District[]>([]);

  const form = useForm<CreateMosqueData>({
    resolver: zodResolver(mosqueSchema),
    defaultValues: {
      name: mosque?.name || "",
      type: mosque?.type,
      related_to: mosque?.related_to,
      suffix: mosque?.suffix || "",
      nickname: mosque?.nickname || "",
      location: {
        region_id: mosque?.location?.region?.id?.toString() || "",
        city_id: mosque?.location?.city?.id?.toString() || "",
        district_id: mosque?.location?.district?.id?.toString() || "",
        lat: mosque?.location?.lat?.toString() || "",
        lng: mosque?.location?.lng?.toString() || "",
      }
    },
  });

  const { execute: saveMosque, isLoading } = useApi<ApiResponse<Mosque>, CreateMosqueData>(
    async (data) => {
      console.log("Executing API call with data:", data);
      const mosqueData = {
        ...data
      };

      try {
        const result = mosque
          ? await mosqueService.updateMosque(mosque.id, mosqueData)
          : await mosqueService.createMosque(mosqueData);
        console.log("API call successful:", result);
        return result;
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log("Success callback triggered:", response);
        if (onMosqueCreated) {
          const formattedData = {
            ...response.data,
            assets: response.data.assets?.map(asset => asset.id) || [],
            facilities: response.data.facilities?.map(facility => facility.id) || [],
          };
          onMosqueCreated(response.data.id, formattedData as CreateMosqueData);
        } else {
          toast({
            title: t(mosque ? 'mosques.edit.success' : 'mosques.create.success'),
            description: t('common.success')
          });
          router.push("/dashboard/mosques");
        }
      },
      onError: (error) => {
        console.error("Error callback triggered:", error);
        toast({
          title: t(mosque ? 'mosques.edit.error' : 'mosques.create.error'),
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const onSubmit = async (data: CreateMosqueData) => {
    console.log("Form submitted with data:", data);
    
    // Validate required location fields
    if (!data.location?.lat || !data.location?.lng) {
      toast({
        title: t('common.error'),
        description: t('mosques.form.locationRequired'),
        variant: "destructive",
      });
      return;
    }

    // Ensure all required fields are present
    if (!data.name || !data.type || !data.related_to || 
        !data.location?.region_id || !data.location?.city_id || !data.location?.district_id) {
      toast({
        title: t('common.error'),
        description: t('common.fillRequired'),
        variant: "destructive",
      });
      return;
    }

    await saveMosque(data);
  };

  // Add watch effect for form changes
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange?.({
        name: value.name || '',
        type: value.type || '',
        related_to: value.related_to || '',
        location: value.location as Location
      });
    });

    return () => subscription.unsubscribe();
  }, [form, onChange]);

  // Update regions effect to also handle initial city and district loading in edit mode
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch regions
        const regionsResponse = await locationService.getRegions({
          per_page: 100
        });
        setLoadedRegions(regionsResponse.data.data);

        // If editing and we have a region_id, fetch cities
        if (mosque?.location?.region?.id) {
          const citiesResponse = await locationService.getCities(
            mosque.location.region.id.toString(),
            { per_page: 100 }
          );
          setLoadedCities(citiesResponse.data.data);
        }

        // If editing and we have a city_id, fetch districts
        if (mosque?.location?.city?.id) {
          const districtsResponse = await locationService.getDistricts(
            mosque.location.city.id.toString(),
            { per_page: 100 }
          );
          setLoadedDistricts(districtsResponse.data.data);
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [mosque?.location?.region?.id, mosque?.location?.city?.id, t, toast]);

  // Update the regionId watch to use useWatch hook
  const regionId = form.watch('location.region_id');
  const cityId = form.watch('location.city_id');

  // Update cities effect
  React.useEffect(() => {
    const fetchCities = async () => {
      if (!regionId) {
        setLoadedCities([]);
        return;
      }

      try {
        const response = await locationService.getCities(regionId.toString(), {
          per_page: 100
        });
        if (response.data?.data) {
          setLoadedCities(response.data.data);
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };

    fetchCities();
  }, [regionId, t, toast]);

  // Update districts effect
  React.useEffect(() => {
    const fetchDistricts = async () => {
      if (!cityId) {
        setLoadedDistricts([]);
        return;
      }

      try {
        const response = await locationService.getDistricts(cityId.toString(), {
          per_page: 100
        });
        if (response.data?.data) {
          setLoadedDistricts(response.data.data);
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };

    fetchDistricts();
  }, [cityId, t, toast]);

  // Update the Select components to use value instead of defaultValue
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('mosques.form.name')}</RequiredLabel>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mosques.form.suffix')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('mosques.form.nickname')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('mosques.form.type')}</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('mosques.form.selectType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(t('mosques.form.types')).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="related_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('mosques.form.relatedTo')}</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('mosques.form.selectRelatedTo')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(t('mosques.form.organizations')).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* location form fields */}
            <FormField
              control={form.control}
              name="location.region_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('locations.form.region')}</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset dependent fields when region changes
                      form.setValue('location.city_id', '');
                      form.setValue('location.district_id', '');
                      setLoadedCities([]);
                      setLoadedDistricts([]);
                    }}
                    value={field.value?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('locations.form.selectRegion')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadedRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {language === 'ar' && region.name_ar ? region.name_ar : region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.city_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('locations.form.city')}</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset district when city changes
                      form.setValue('location.district_id', '');
                      setLoadedDistricts([]);
                    }}
                    value={field.value?.toString() || ''}
                    disabled={!form.watch('location.region_id')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('locations.form.selectCity')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadedCities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {language === 'ar' && city.name_ar ? city.name_ar : city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.district_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabel>{t('locations.form.district')}</RequiredLabel>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString() || ''}
                    disabled={!form.watch('location.city_id')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('locations.form.selectDistrict')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadedDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.id.toString()}>
                          {language === 'ar' && district.name_ar ? district.name_ar : district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Second column with QR code */}
          <div className="flex flex-col gap-4 items-center">
            {mosque?.code && (
              <>
                <div className="flex flex-col items-center gap-2 relative w-full">
                  <span className="absolute top-0 left-0 text-xs">
                    {mosque.code}
                  </span>
                  <span>
                    مسجد
                  </span>
                  <h2 className="text-lg font-semibold">{mosque.name}</h2>
                </div>
                <QRCode 
                  code={mosque.code}
                  image={form.watch('related_to') === 'awqaf' 
                    ? '/assets/Awqaf.png' 
                    : form.watch('related_to') === 'moia' 
                      ? '/assets/Moia.png' 
                      : undefined
                  }
                  width={200}
                  height={200}
                  mosqueName={mosque.name}
                />
              </>
            )}
          </div>
        </div>

        {/* Map picker section */}
        <div>
          <FormLabel className="mb-2">
            <RequiredLabel>{t('mosques.form.mapLocation')}</RequiredLabel>
          </FormLabel>
          <MapPicker 
            className="my-2"
            value={{
              lat: Number(form.watch('location.lat')) || 0,
              lng: Number(form.watch('location.lng')) || 0
            }}
            onChange={(location) => {
              form.setValue('location.lat', location.lat.toString() || '');
              form.setValue('location.lng', location.lng.toString() || '');
            }}
          />
        </div>

        {/* Form actions */}
        <div className="flex justify-end gap-4 mt-6">
          {!hideCancelButton && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/mosques")}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t(mosque ? 'mosques.edit.submit' : 'mosques.create.submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
} 