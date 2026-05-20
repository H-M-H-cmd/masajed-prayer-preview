"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/providers/language-provider"
import { MosqueMember } from "@/types/mosque-member"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string()
    .min(9, { message: "Phone must be at least 9 characters" })
    .max(9, { message: "Phone must not exceed 9 characters" })
    .regex(/^5\d{8}$/, { message: "Phone must start with 5 and be exactly 9 digits" }),
  id_number: z.string()
    .min(10, { message: "ID number must be at least 10 characters" })
    .max(10, { message: "ID number must not exceed 10 characters" }),
  group: z.enum(["admin", "member"]),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface MemberFormProps {
  member?: MosqueMember
  onSubmit: (data: FormData) => void
  isLoading?: boolean
}

export function UpdateCreateForm({ member, onSubmit, isLoading }: MemberFormProps) {
  const { t, direction } = useLanguage()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      phone: member?.phone || "",
      id_number: member?.id_number?.toString() || "",
      group: (member?.group as "admin" | "member") || "member",
      is_active: member?.is_active ?? true,
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      const res = await onSubmit(data)
      console.log(res)

      toast({
        title: member ? t('members.updateSuccess') : t('members.createSuccess'),
        description: t('common.success'),
      })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('members.name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('members.phone')}</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                  +966
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    dir="ltr" 
                    className={cn(
                      "transition-all duration-200 focus:ring-2 focus:ring-primary text-lg tracking-wide pl-14",
                      form.formState.errors.phone && "border-destructive focus:ring-destructive"
                    )}
                    maxLength={9}
                    minLength={9}
                    placeholder="5XX XXX XXXX"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="id_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('members.idNumber')}</FormLabel>
              <FormControl>
                <Input {...field} maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('members.group')}</FormLabel>
              <Tabs
                value={field.value}
                onValueChange={field.onChange}
                className="w-full"
                dir={direction}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="admin">{t('members.groups.admin')}</TabsTrigger>
                  <TabsTrigger value="member">{t('members.groups.member')}</TabsTrigger>
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('members.status')}</FormLabel>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('common.loading') : member ? t('common.save') : t('members.addMember')}
        </Button>
      </form>
    </Form>
  )
} 