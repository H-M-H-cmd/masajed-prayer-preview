"use client";
import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VolunteerDrawer } from "../volunteer-drawer";
import { useLanguage } from "@/providers/language-provider";
import { VolunteerOpportunity } from "@/types/volunteer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { volunteerSchema, VolunteerFormValues } from "../schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/DatePicker";
import { InputTags } from "@/components/ui/input-with-inner-tags";
import { useCallback, useRef } from "react";

interface UpdateCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer?: VolunteerOpportunity;
  onSubmit: (data: VolunteerFormValues) => Promise<void>;
  mode: "create" | "edit";
}

export function UpdateCreate({
  open,
  onOpenChange,
  volunteer,
  onSubmit,
  mode,
}: UpdateCreateProps) {
  const { t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {t(
                mode === "create"
                  ? "volunteers.drawer.createTitle"
                  : "volunteers.drawer.editTitle"
              )}
            </DialogTitle>
          </DialogHeader>
          <VolunteerDrawer
            open={open}
            onOpenChange={onOpenChange}
            volunteer={volunteer}
            onSubmit={onSubmit}
            mode={mode}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <VolunteerDrawer
      open={open}
      onOpenChange={onOpenChange}
      volunteer={volunteer}
      onSubmit={onSubmit}
      mode={mode}
    />
  );
}

interface UpdateCreateFormProps {
  volunteer?: VolunteerOpportunity;
  onSubmit: (data: VolunteerFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function UpdateCreateForm({ volunteer, onSubmit, isLoading }: UpdateCreateFormProps) {
  const { t } = useLanguage();

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: React.useMemo(
      () =>
        volunteer
          ? {
              ...volunteer,
              type: volunteer.type as "volunteer" | "training",
              gender: volunteer.gender === "both" ? "all" : volunteer.gender,
              mosques: volunteer.mosques?.map((mosque) => mosque.toString()) || [],
              start_at: volunteer.start_at || undefined,
              end_at: volunteer.end_at || undefined,
              application_deadline: volunteer.application_deadline || undefined,
              age_from: volunteer.age_from || null,
              age_to: volunteer.age_to || null,
              capacity: volunteer.capacity || null,
              reward_amount: volunteer.reward_amount || null,
              volunteer_hours: volunteer.volunteer_hours || null,
              skills: volunteer.skills || [],
            }
          : {
              title: "",
              type: "volunteer",
              start_at: undefined,
              end_at: undefined,
              gender: "all",
              age_from: null,
              age_to: null,
              description: "",
              requirements: "",
              skills: [],
              has_financial_reward: false,
              reward_amount: null,
              has_certificate_reward: false,
              has_hours_reward: false,
              volunteer_hours: null,
              has_training: false,
              capacity: null,
              status: "draft",
              application_deadline: undefined,
              supervisor_id: "",
              mosques: [],
            },
      [volunteer]
    ),
  });

  const handleSubmit = async (data: VolunteerFormValues) => {
    const formattedData = {
      ...data,
    };
    await onSubmit(formattedData);
    if (!volunteer) {
      form.reset();
    }
  };

  const onChangeRef = useRef<(value: string[]) => void>(() => {});

  React.useEffect(() => {
    const skillsField = form.control._fields.skills as { _f?: { onChange: (value: string[]) => void } };
    if (skillsField && skillsField._f && skillsField._f.onChange) {
      onChangeRef.current = skillsField._f.onChange;
    }
  }, [form.control._fields.skills]);

  const handleTagsChange = useCallback(
    (tags: { id: string; text: string }[]) => onChangeRef.current(tags.map(tag => tag.text)),
    []
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("volunteers.form.title")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("volunteers.form.titlePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.type")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("volunteers.form.typePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer">{t("volunteers.types.volunteer")}</SelectItem>
                      <SelectItem value="training">{t("volunteers.types.training")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.gender")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("volunteers.form.genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("volunteers.gender.male")}</SelectItem>
                      <SelectItem value="female">{t("volunteers.gender.female")}</SelectItem>
                      <SelectItem value="all">{t("volunteers.gender.all")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.startAt")}</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
                    placeHolder={t("volunteers.form.startAtPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.endAt")}</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
                    placeHolder={t("volunteers.form.endAtPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.ageFrom")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.ageTo")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("volunteers.form.description")}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t("volunteers.form.descriptionPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("volunteers.form.requirements")}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t("volunteers.form.requirementsPlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputTags
                    value={(field.value || []).map((text: string, index: number) => ({ id: index.toString(), text }))}
                    onChange={handleTagsChange}
                    label={t("volunteers.form.skills")}
                    placeholder={t("volunteers.form.skillsPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">

            <FormField
              control={form.control}
              name="has_financial_reward"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between ">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("volunteers.form.hasFinancialReward")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch("has_financial_reward") && (
              <FormField
                control={form.control}
                name="reward_amount"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>{t("volunteers.form.rewardAmount")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="has_certificate_reward"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between max-h-fit rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t("volunteers.form.hasCertificateReward")}</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="rounded-lg border p-4">

            <FormField
              control={form.control}
              name="has_hours_reward"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("volunteers.form.hasHoursReward")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch("has_hours_reward") && (
              <FormField
                control={form.control}
                name="volunteer_hours"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>{t("volunteers.form.volunteerHours")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="has_training"
            render={({ field }) => (
              <FormItem className="flex items-center max-h-fit justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t("volunteers.form.hasTraining")}</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.capacity")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.status")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("volunteers.form.statusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("volunteers.status.draft")}</SelectItem>
                      <SelectItem value="open">{t("volunteers.status.open")}</SelectItem>
                      <SelectItem value="closed">{t("volunteers.status.closed")}</SelectItem>
                      <SelectItem value="cancelled">{t("volunteers.status.cancelled")}</SelectItem>
                      <SelectItem value="completed">{t("volunteers.status.completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="application_deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("volunteers.form.applicationDeadline")}</FormLabel>
                <FormControl>
                  <DatePicker 
                    date={field.value} 
                    setDate={field.onChange} 
                    placeHolder={t("volunteers.form.applicationDeadlinePlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {t(volunteer ? "common.save" : "common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
