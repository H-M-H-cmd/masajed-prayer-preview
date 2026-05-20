"use client";

import * as React from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { facilityService } from "@/services/facility.service";
import { FacilityValue, FacilityGroup } from "@/types/facility"
import { useLanguage } from "@/providers/language-provider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { mosqueService } from "@/services/mosque.service";
import { useApi } from "@/hooks/use-api";
import { Facility, FacilityFormData, MosqueFacilitiesFormProps } from "@/types/facility";


// Create a schema for a single facility
const facilitySchema = z.object({
    facility_id: z.string(),
    enabled: z.boolean(),
    value: z.string().optional()
});

// Create a schema for the form
const facilitiesFormSchema = z.object({
    facilities: z.record(z.string(), facilitySchema)
});

type FormData = z.infer<typeof facilitiesFormSchema>;

interface ExtendedMosqueFacilitiesFormProps extends MosqueFacilitiesFormProps {
    hideCancelButton?: boolean;
}
export function MosqueFacilitiesForm({ mosque, onFacilitiesUpdated, onChange, hideCancelButton = false }: ExtendedMosqueFacilitiesFormProps) {
    const { t, language } = useLanguage();
    const [facilityGroups, setFacilityGroups] = React.useState<FacilityGroup[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();
    const [isInitialized, setIsInitialized] = React.useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(facilitiesFormSchema),
        defaultValues: {
            facilities: {}
        }
    });

    const { execute: updateFacilities, isLoading: isUpdating } = useApi(
        async (facilities: { id: string; value: number | null }[]) => {
            if (!mosque?.id) throw new Error('Mosque ID is required');
            return mosqueService.updateMosqueFacilities(mosque.id, facilities);
        },
        {
            onSuccess: (response) => {
                toast.success(t('mosques.form.facilities.success'));
                const updatedFacilities: FacilityValue[] = (response.data.facilities || []).map((facility: Facility) => ({
                    id: facility.id,
                    value: facility.pivot?.value ? Number(facility.pivot.value) : undefined
                }));
                onFacilitiesUpdated?.(updatedFacilities);
            },
            onError: (error) => {
                toast.error(t('mosques.form.facilities.error'), {
                    description: error.message
                });
            }
        }
    );

    // Add a ref to track if the form has been initialized
    const formInitializedRef = React.useRef(false);

    // First useEffect - add missing dependencies
    React.useEffect(() => {
        // Skip if already initialized
        if (formInitializedRef.current) return;

        const fetchFacilities = async () => {
            try {
                setIsLoading(true);
                const response = await facilityService.getFacilities({ per_page: 100 });

                // Group facilities
                const groups = response.data.data.reduce((acc: FacilityGroup[], facility) => {
                    const group = acc.find(g => g.name === facility.group);
                    if (group) {
                        group.facilities.push(facility);
                    } else {
                        acc.push({
                            name: facility.group,
                            name_ar: facility.group_ar,
                            facilities: [facility]
                        });
                    }
                    return acc;
                }, []);

                setFacilityGroups(groups);

                // Initialize form with existing facilities
                const initialFacilities = response.data.data.reduce((acc, facility) => {
                    const existingFacility = mosque?.facilities?.find(f => f.id === facility.id);
                    acc[facility.id] = {
                        facility_id: facility.id,
                        enabled: !!existingFacility,
                        value: existingFacility?.pivot?.value || ''
                    };
                    return acc;
                }, {} as Record<string, typeof facilitySchema._type>);

                form.reset({ facilities: initialFacilities });

                // Mark as initialized
                formInitializedRef.current = true;
                setIsInitialized(true);

                // Trigger initial onChange with existing facilities
                if (mosque?.facilities) {
                    const initialFacilityValues: FacilityValue[] = mosque.facilities.map(f => ({
                        id: f.id,
                        value: f.pivot?.value ? Number(f.pivot.value) : null
                    }));
                    onChange?.(initialFacilityValues);
                }
            } catch (error) {
                toast.error(t('common.error'), {
                    description: (error as Error).message
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchFacilities();
    }, [mosque?.id, mosque?.facilities, form, onChange, t]); // Add missing dependencies

    // Second useEffect - already has correct dependencies
    React.useEffect(() => {
        if (!isInitialized) return;

        const subscription = form.watch((value) => {
            if (!value.facilities || !formInitializedRef.current) return;

            const timeoutId = setTimeout(() => {
                const facilitiesData: FacilityValue[] = Object.values(value.facilities || {})
                    .filter((f): f is FacilityFormData =>
                        f !== undefined &&
                        f.enabled === true &&
                        typeof f.facility_id === 'string'
                    )
                    .map(f => ({
                        id: f.facility_id,
                        value: f.value ? Number(f.value) : null
                    }));

                onChange?.(facilitiesData);
            }, 300);

            return () => clearTimeout(timeoutId);
        });

        return () => subscription.unsubscribe();
    }, [form, onChange, isInitialized, t]);

    const onSubmit = async (data: FormData) => {
        const facilitiesData: { id: string; value: number | null }[] = Object.values(data.facilities)
            .filter((f): f is FacilityFormData => f !== undefined && f.enabled)
            .map(f => ({
                id: f.facility_id,
                value: f.value ? Number(f.value) : null
            }));

        await updateFacilities(facilitiesData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 grid-cols-2 mb-6">
                {facilityGroups.map((group, index) => (
                    <div key={index}>
                        <h2 className="text-lg font-semibold mb-4">
                            {language === 'ar' ? group.name_ar : group.name}
                        </h2>
                        <div className="grid gap-2">
                            {group.facilities.map((facility) => (
                                <FormField
                                    key={facility.id}
                                    control={form.control}
                                    name={`facilities.${facility.id}`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <div className="flex items-center justify-between h-10">
                                                <div className="flex items-center gap-4">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value?.enabled || false}
                                                            onCheckedChange={(checked) => {
                                                                form.setValue(`facilities.${facility.id}`, {
                                                                    ...field.value,
                                                                    enabled: checked
                                                                });
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-base cursor-pointer">
                                                        {language === 'ar' ? facility.name_ar : facility.name}
                                                    </FormLabel>
                                                </div>
                                                {field.value?.enabled && facility.metadata && (
                                                    <div className="ml-4">
                                                        <FormControl>
                                                            <Input
                                                                type={facility.metadata.type === 'number' ? 'number' : 'text'}
                                                                value={field.value.value || ''}
                                                                onChange={(e) => {
                                                                    form.setValue(`facilities.${facility.id}`, {
                                                                        ...field.value,
                                                                        value: e.target.value
                                                                    });
                                                                }}
                                                                placeholder={language === 'ar' ?
                                                                    facility.metadata.field_name_ar :
                                                                    facility.metadata.field_name
                                                                }
                                                                className="w-[120px]"
                                                            />
                                                        </FormControl>
                                                    </div>
                                                )}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                <div className="flex justify-end gap-4 col-span-2">
                    {!hideCancelButton &&
                        (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard/mosques")}
                                disabled={isLoading || isUpdating}
                            >
                                {t('common.cancel')}
                            </Button>
                        )}
                    <Button type="submit" disabled={isLoading || isUpdating}>
                        {(isLoading || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!hideCancelButton ? t('common.submit') : t('mosques.edit.submit')}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 