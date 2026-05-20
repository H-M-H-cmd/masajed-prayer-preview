"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/providers/language-provider"

// Define the form data type to match the form structure
interface EventFormData {
  title: string;
  type: "social" | "educational" | "announcement";
  start_at: string;
  end_at: string;
  mosque_id: string;
  allow_comments: boolean;
  description: string;
  status: string;
  attachments: string[];
}
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CreateEventData, Event } from "@/types/event"
import { eventSchema } from "../schema"
import { ImageUpload } from "@/components/ui/image-upload"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

interface UpdateCreateFormProps {
  event?: Event
  onSubmit: (data: CreateEventData) => Promise<void>
  isLoading?: boolean
}

const eventTypes = [
  { value: "social", label: "Social" },
  { value: "educational", label: "Educational" },
  { value: "announcement", label: "Announcement" },
]

const eventStatuses = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
]

export function UpdateCreateForm({ event, onSubmit, isLoading }: UpdateCreateFormProps) {
  const { t } = useLanguage()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      type: event?.type || "social",
      start_at: event?.start_at || "",
      end_at: event?.end_at || "",
      mosque_id: event?.mosque_id || "",
      allow_comments: event?.allow_comments || false,
      description: event?.description || "",
      status: event?.status || "draft",
      // Convert attachments to the format expected by ImageUpload
      attachments: event?.attachments?.map(attachment => attachment.url) || [],
    },
  })

  const handleSubmit = async (formData: EventFormData) => {
    const eventData: CreateEventData = {
      ...formData,
      attachments: formData.attachments.map(url => ({
        id: 0, // The backend will assign the actual ID
        url,
        file_name: url.split('/').pop() || 'file',
        mime_type: 'image/jpeg',
        size: 0
      }))
    }
    await onSubmit(eventData)

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("events.form.title")}</FormLabel>
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
              <FormLabel>{t("events.form.type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("events.form.selectType")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(`events.types.${type.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
          />
          </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("events.form.startAt")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP HH:mm")
                        ) : (
                          <span>{t("events.form.selectStartDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentValue = field.value ? new Date(field.value) : new Date()
                          date.setHours(currentValue.getHours())
                          date.setMinutes(currentValue.getMinutes())
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":")
                          const date = field.value ? new Date(field.value) : new Date()
                          date.setHours(parseInt(hours))
                          date.setMinutes(parseInt(minutes))
                          field.onChange(date.toISOString())
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("events.form.endAt")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP HH:mm")
                        ) : (
                          <span>{t("events.form.selectEndDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentValue = field.value ? new Date(field.value) : new Date()
                          date.setHours(currentValue.getHours())
                          date.setMinutes(currentValue.getMinutes())
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) => {
                        const startDate = form.getValues("start_at")
                        return startDate ? date < new Date(startDate) : date < new Date()
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":")
                          const date = field.value ? new Date(field.value) : new Date()
                          date.setHours(parseInt(hours))
                          date.setMinutes(parseInt(minutes))
                          field.onChange(date.toISOString())
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="hidden md:block">
              <FormLabel>{t("events.form.description")}</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  className="min-h-auto resize-none"
                  placeholder={t("events.form.description")}
                />
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
              <FormLabel>{t("events.form.status")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("events.form.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {t(`events.statuses.${status.value}`)}
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
          name="allow_comments"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("events.form.allowComments")}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
          <FormItem>
            <FormLabel>{t("events.form.attachments")}</FormLabel>
            <FormControl>
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              maxFiles={5}
              maxSize={10}
              onRemove={(url: string) => {
              field.onChange(field.value.filter((val: string) => val !== url));
              }}
            />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("common.loading") : event ? t("common.save") : t("events.form.create")}
        </Button>
      </form>
    </Form>
  )
} 