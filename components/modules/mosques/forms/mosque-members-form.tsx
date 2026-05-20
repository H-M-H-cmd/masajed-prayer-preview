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
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language-provider";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MembershipType, MosqueMember } from "@/types/mosque-member";
import { mosqueMemberService } from "@/services/mosque-member.service"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mosqueService } from "@/services/mosque.service";
import { MemberFormValues } from "@/types/mosque-member";
import { Mosque } from "@/types/mosque"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";


type TranslationFunction = (key: string, params?: Record<string, unknown>) => string;

const memberFormSchema = (t: TranslationFunction) => z.object({
  name: z.string().min(1, t('common.required')),
  phone: z.string().regex(/^\+966\d{9}$/, t('auth.phoneFormat')),
  id_number: z.string()
    .min(10, t('auth.verification.idNumberLength'))
    .max(10, t('auth.verification.idNumberLength'))
    .regex(/^[0-9]+$/, t('auth.verification.idNumberFormat'))
    .refine((value) => {
      return value.startsWith('1') || value.startsWith('2');
    }, t('auth.verification.idNumberStart')),
  membership: z.enum(['imam', 'muathen', 'nazir1', 'nazir2', 'volunteer', 'permanent_volunteer'] as const),
});

interface MainMemberFormValues {
  name: string;
  phone: string;
  id_number: string;
}

const mainMemberSchema = (t: TranslationFunction) => z.object({
  name: z.string().min(1, t('common.required')),
  phone: z.string().regex(/^\+966\d{9}$/, t('auth.phoneFormat')),
  id_number: z.string()
    .min(10, t('auth.verification.idNumberLength'))
    .max(10, t('auth.verification.idNumberLength'))
    .regex(/^[0-9]+$/, t('auth.verification.idNumberFormat'))
    .refine((value) => {
      return value.startsWith('1') || value.startsWith('2');
    }, t('auth.verification.idNumberStart')),
});

interface MosqueMembersFormProps {
  mosque: Mosque;
  onMembersUpdated?: () => void;
  onChange?: (members: MosqueMember[]) => void;
}

const REQUIRED_MEMBERSHIPS: MembershipType[] = ['imam', 'muathen', 'nazir1'];

// Update the error animation variants
const errorAnimation = {
  initial: { 
    opacity: 0, 
    height: 0,
    marginTop: 0 
  },
  animate: { 
    opacity: 1, 
    height: "auto",
    marginTop: 8,
    transition: {
      height: {
        type: "spring",
        stiffness: 500,
        damping: 30
      },
      opacity: {
        duration: 0.2
      }
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      height: {
        duration: 0.2
      },
      opacity: {
        duration: 0.1
      }
    }
  }
};

// Add interface for server error response
interface ServerError {
  message: string;
  errors?: Record<string, string[]>;
}

export function MosqueMembersForm({ mosque, onMembersUpdated, onChange }: MosqueMembersFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [members, setMembers] = React.useState<MosqueMember[]>(mosque.prayers || []);
  const [filledPositions, setFilledPositions] = React.useState<Set<MembershipType>>(() => {
    // Initialize filled positions from mosque data
    const filled = new Set<MembershipType>();
    mosque.prayers?.forEach(member => {
      if (REQUIRED_MEMBERSHIPS.includes(member.membership as MembershipType)) {
        filled.add(member.membership as MembershipType);
      }
    });
    return filled;
  });
  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = React.useState<MosqueMember | null>(null);

  // Move useForm hooks outside of useMemo to fix rules-of-hooks error
  const imamForm = useForm<MainMemberFormValues>({
    resolver: zodResolver(mainMemberSchema(t)),
    defaultValues: {
      name: mosque.prayers?.find(m => m.membership === 'imam')?.name || "",
      phone: mosque.prayers?.find(m => m.membership === 'imam')?.phone || "+966",
      id_number: mosque.prayers?.find(m => m.membership === 'imam')?.id_number?.toString() || ""
    },
    mode: "onChange"
  });

  const muathenForm = useForm<MainMemberFormValues>({
    resolver: zodResolver(mainMemberSchema(t)),
    defaultValues: {
      name: mosque.prayers?.find(m => m.membership === 'muathen')?.name || "",
      phone: mosque.prayers?.find(m => m.membership === 'muathen')?.phone || "+966",
      id_number: mosque.prayers?.find(m => m.membership === 'muathen')?.id_number?.toString() || ""
    },
    mode: "onChange"
  });

  const nazir1Form = useForm<MainMemberFormValues>({
    resolver: zodResolver(mainMemberSchema(t)),
    defaultValues: {
      name: mosque.prayers?.find(m => m.membership === 'nazir1')?.name || "",
      phone: mosque.prayers?.find(m => m.membership === 'nazir1')?.phone || "+966",
      id_number: mosque.prayers?.find(m => m.membership === 'nazir1')?.id_number?.toString() || ""
    },
    mode: "onChange"
  });

  // Create mainMemberForms object from individual forms
  const mainMemberForms = React.useMemo(() => ({
    imam: imamForm,
    muathen: muathenForm,
    nazir1: nazir1Form
  }), [imamForm, muathenForm, nazir1Form]);

  // Update additional member form
  const additionalMemberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema(t)),
    defaultValues: {
      name: "",
      phone: "+966",
      id_number: "",
      membership: "volunteer",
    },
    mode: "onChange"
  });

  // Update edit member form
  const editMemberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema(t)),
    defaultValues: {
      name: "",
      phone: "+966",
      id_number: "",
      membership: "volunteer",
    },
    mode: "onChange"
  });

  // Update the useEffect hooks for real-time validation

  // For additional member form
  React.useEffect(() => {
    const subscription = additionalMemberForm.watch((value) => {
      if (value) {
        // Trigger validation for the specific field that changed
        additionalMemberForm.trigger();
      }
    });
    return () => subscription.unsubscribe();
  }, [additionalMemberForm]);

  // For edit member form
  React.useEffect(() => {
    const subscription = editMemberForm.watch((value) => {
      if (value) {
        // Trigger validation for the specific field that changed
        editMemberForm.trigger();
      }
    });
    return () => subscription.unsubscribe();
  }, [editMemberForm]);

  // For main member forms
  React.useEffect(() => {
    const subscriptions = Object.values(mainMemberForms).map(form => 
      form.watch((value) => {
        if (value) {
          form.trigger();
        }
      })
    );
    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, [mainMemberForms]);

  // Update setMembers to also trigger onChange
  const updateMembers = React.useCallback((newMembers: MosqueMember[]) => {
    setMembers(newMembers);
    onChange?.(newMembers);
  }, [onChange]);

  // Update useEffect for initial load
  React.useEffect(() => {
    const fetchMosque = async () => {
      try {
        const response = await mosqueService.getMosque(mosque.id);
        const mosqueMembers = response.data.prayers || [];
        updateMembers(mosqueMembers as unknown as MosqueMember[]);
        
        // Update filled positions and form values
        const filled = new Set<MembershipType>();
        mosqueMembers.forEach(member => {
          if (REQUIRED_MEMBERSHIPS.includes(member.membership as MembershipType)) {
            filled.add(member.membership as MembershipType);
            if (mainMemberForms[member.membership as keyof typeof mainMemberForms]) {
              mainMemberForms[member.membership as keyof typeof mainMemberForms].reset({
                name: member.name,
                phone: member.phone,
                id_number: member.id_number?.toString() || ""
              });
            }
          }
        });
        setFilledPositions(filled);
      } catch (error) {
        toast.error(t('common.error'), {
          description: (error as Error).message
        });
      }
    };

    fetchMosque();
  }, [mosque.id, t, mainMemberForms, updateMembers]);

  const formatPhoneNumber = (value: string): string => {
    // Remove any non-digit characters
    value = value.replace(/\D/g, '');
    
    // Remove leading 966 or 05 if present
    value = value.replace(/^(966|05)/, '');
    
    // Ensure starts with 5 if there are any digits
    if (value.length > 0 && !value.startsWith('5')) {
      value = '5' + value;
    }
    
    // Limit to 9 digits (5XXXXXXXX)
    value = value.slice(0, 9);
    
    // Format with spaces for readability (5X XXX XXXX)
    if (value.length > 0) {
      value = value.match(/.{1,1}|.+/g)!.join('') // First digit
      if (value.length > 1) {
        value = value.slice(0, 1) + ' ' + value.slice(1).match(/.{1,3}|.+/g)!.join(' ');
      }
    }
    
    return value;
  };

  // Create separate handlers for each form type
  const handleMemberPhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    form: ReturnType<typeof useForm<MemberFormValues>>
  ) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    form.setValue('phone', '+966' + formattedValue.replace(/\s/g, ''));
  };

  const handleMainMemberPhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    form: ReturnType<typeof useForm<MainMemberFormValues>>
  ) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    form.setValue('phone', '+966' + formattedValue.replace(/\s/g, ''));
  };

  const handleMemberIdNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    form: ReturnType<typeof useForm<MemberFormValues>>
  ) => {
    const formattedValue = formatIdNumber(e.target.value);
    form.setValue('id_number', formattedValue || '');
  };

  const handleMainMemberIdNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    form: ReturnType<typeof useForm<MainMemberFormValues>>
  ) => {
    const formattedValue = formatIdNumber(e.target.value);
    form.setValue('id_number', formattedValue || '');
  };

  // Update the ID number formatting and handling
  const formatIdNumber = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    
    // Convert to string if it's a number
    const stringValue = value.toString();
    
    // Remove any non-digit characters
    const cleanValue = stringValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    return cleanValue.slice(0, 10);
  };

  // Update the handleMainMemberSubmit function
  const handleMainMemberSubmit = async (membership: MembershipType, data: MainMemberFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await mosqueMemberService.createMember({
        ...data,
        mosque_id: mosque.id,
        membership,
        is_active: true,
        id_number: data.id_number,
        gender: "male",
      });
      console.log(response)

      // Fetch updated mosque data
      const updatedMosqueResponse = await mosqueService.getMosque(mosque.id);
      if (updatedMosqueResponse.data.prayers) {
        updateMembers(updatedMosqueResponse.data.prayers as unknown as MosqueMember[]);
        setFilledPositions(prev => new Set([...prev, membership]));
      }

      toast.success(t('mosques.form.members.success'));
    } catch (error) {
      // Handle server validation errors
      const serverError = error as ServerError;
      const form = mainMemberForms[membership as keyof typeof mainMemberForms];
      
      if (serverError.errors) {
        // Set server errors to form fields
        Object.keys(serverError.errors).forEach((key) => {
          form.setError(key as keyof MainMemberFormValues, {
            type: 'server',
            message: serverError.errors![key][0]
          });
        });
      } else {
        toast.error(t('common.error'), {
          description: serverError.message
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the onSubmit handler
  const onSubmit = async (data: MemberFormValues) => {
    try {
      setIsSubmitting(true);
      
      await mosqueMemberService.createMember({
        ...data,
        mosque_id: mosque.id,
        gender: 'male',
        is_active: true,
      });

      // Reset the form with validation state clearing
      additionalMemberForm.reset({
        name: "",
        phone: "+966",
        id_number: "",
        membership: "volunteer",
      }, {
        keepIsSubmitted: false,
        keepErrors: false,
        keepTouched: false,
        keepDirty: false,
        keepIsValid: false,
      });

      // Clear all validation states
      additionalMemberForm.clearErrors();

      // Fetch updated mosque data
      const updatedMosqueResponse = await mosqueService.getMosque(mosque.id);
      if (updatedMosqueResponse.data.prayers) {
        updateMembers(updatedMosqueResponse.data.prayers as unknown as MosqueMember[]);
      }

      toast.success(t('mosques.form.members.success'));
    } catch (error) {
      // Handle server validation errors
      const serverError = error as ServerError;
      if (serverError.errors) {
        // Set server errors to form fields
        Object.keys(serverError.errors).forEach((key) => {
          additionalMemberForm.setError(key as keyof MemberFormValues, {
            type: 'server',
            message: serverError.errors![key][0]
          });
        });
      } else {
        toast.error(t('mosques.form.members.error'), {
          description: serverError.message
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    // Check if all required positions are filled
    const missingPositions = REQUIRED_MEMBERSHIPS.filter(pos => !filledPositions.has(pos));
    
    if (missingPositions.length > 0) {
      toast.error(t('common.error'), {
        description: t(`mosques.form.members.required.${missingPositions[0]}`)
      });
      return;
    }

    onMembersUpdated?.();
  };

  const handleEditClick = (member: MosqueMember) => {
    setEditingMemberId(member.id);
    editMemberForm.reset({
      name: member.name,
      phone: member.phone,
      id_number: member.id_number?.toString() || '', // Convert to string
      membership: member.membership,
    });
  };

  const handleEditSubmit = async (data: MemberFormValues) => {
    if (!editingMemberId) return;

    try {
      setIsSubmitting(true);
      await mosqueMemberService.updateMember(editingMemberId!, {
        ...data,
        mosque_id: mosque.id,
        gender: 'male',
        is_active: true,
      });

      // Fetch updated mosque data
      const updatedMosqueResponse = await mosqueService.getMosque(mosque.id);
      if (updatedMosqueResponse.data.prayers) {
        updateMembers(updatedMosqueResponse.data.prayers as unknown as MosqueMember[]);
      }

      setEditingMemberId(null);
      toast.success(t('mosques.form.members.updateSuccess'));
    } catch (error) {
      // Handle server validation errors
      const serverError = error as ServerError;
      if (serverError.errors) {
        // Set server errors to form fields
        Object.keys(serverError.errors).forEach((key) => {
          editMemberForm.setError(key as keyof MemberFormValues, {
            type: 'server',
            message: serverError.errors![key][0]
          });
        });
      } else {
        toast.error(t('mosques.form.members.updateError'), {
          description: serverError.message
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    editMemberForm.reset();
  };

  // Update the handleDelete function
  const handleDelete = async (member: MosqueMember) => {
    try {
      setIsSubmitting(true);
      await mosqueMemberService.detachFromMosque(member.id, mosque.id.toString());

      // Fetch updated mosque data
      const updatedMosqueResponse = await mosqueService.getMosque(mosque.id);
      if (updatedMosqueResponse.data.prayers) {
        updateMembers(updatedMosqueResponse.data.prayers as unknown as MosqueMember[]);
      }

      toast.success(t('mosques.form.members.deleteSuccess'));
      setMemberToDelete(null);
    } catch (error) {
      toast.error(t('mosques.form.members.deleteError'), {
        description: (error as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the form renderers to use the specific form types
  const renderMemberFormField = (
    form: ReturnType<typeof useForm<MemberFormValues>>,
    name: keyof MemberFormValues,
    placeholder: string,
    isDisabled = false,
    type: 'text' | 'phone' = 'text'
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex-1 h-[50px]">
          <div className="relative">
            <FormControl>
              {type === 'phone' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                    +966
                  </div>
                  <Input
                    {...field}
                    disabled={isDisabled}
                    value={field.value.replace('+966', '').replace(/(\d{1})(\d{3})(\d{4})/, '$1 $2 $3')}
                    onChange={(e) => handleMemberPhoneChange(e, form)}
                    placeholder="5X XXX XXXX"
                    className={cn(
                      "pl-14 transition-all duration-200 text-lg tracking-wide h-10",
                      fieldState.error && "border-destructive focus-visible:ring-destructive"
                    )}
                    dir="ltr"
                  />
                </div>
              ) : (
                <Input 
                  {...field}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  className={cn(
                    "h-10",
                    fieldState.error && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              )}
            </FormControl>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  variants={errorAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-destructive text-sm absolute w-full"
                >
                  {fieldState.error.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormItem>
      )}
    />
  );

  const renderMainMemberFormField = (
    form: ReturnType<typeof useForm<MainMemberFormValues>>,
    name: keyof MainMemberFormValues,
    placeholder: string,
    isDisabled = false,
    type: 'text' | 'phone' = 'text'
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex-1 h-[50px]">
          <div className="relative">
            <FormControl>
              {type === 'phone' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                    +966
                  </div>
                  <Input
                    {...field}
                    disabled={isDisabled}
                    value={field.value.replace('+966', '').replace(/(\d{1})(\d{3})(\d{4})/, '$1 $2 $3')}
                    onChange={(e) => handleMainMemberPhoneChange(e, form)}
                    placeholder="5X XXX XXXX"
                    className={cn(
                      "pl-14 transition-all duration-200 text-lg tracking-wide h-10",
                      fieldState.error && "border-destructive focus-visible:ring-destructive"
                    )}
                    dir="ltr"
                  />
                </div>
              ) : (
                <Input 
                  {...field}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  className={cn(
                    "h-10",
                    fieldState.error && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              )}
            </FormControl>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  variants={errorAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-destructive text-sm absolute w-full"
                >
                  {fieldState.error.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormItem>
      )}
    />
  );

  // Update the form renderers to use the specific form types
  const renderMemberForm = (member: MosqueMember, isEditing: boolean) => {
    if (isEditing) {
      return (
        <Form {...editMemberForm}>
          <form onSubmit={editMemberForm.handleSubmit(handleEditSubmit)} 
                className="flex items-center gap-4">
            {renderMemberFormField(editMemberForm, 'name', t('mosques.form.members.name'))}
            {renderMemberFormField(editMemberForm, 'phone', '', false, 'phone')}
            {renderMemberIdNumberField(editMemberForm)}
            {member.membership && !REQUIRED_MEMBERSHIPS.includes(member.membership) && (
              renderMembershipField(editMemberForm)
            )}
            <div className="flex gap-2 h-[50px]">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.save')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Form>
      );
    }

    // Updated view mode with delete button
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-[50px]">
          <Input 
            value={member.name}
            disabled
            placeholder={t('mosques.form.members.name')}
          />
        </div>

        <div className="flex-1 h-[50px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
              +966
            </div>
            <Input
              value={member.phone.replace('+966', '').replace(/(\d{1})(\d{3})(\d{4})/, '$1 $2 $3')}
              disabled
              className={cn(
                "pl-14 transition-all duration-200 text-lg tracking-wide",
              )}
              dir="ltr"
              placeholder="5X XXX XXXX"
            />
          </div>
        </div>

        <div className="flex-1 h-[50px]">
          <Input 
            value={formatIdNumber(member.id_number) || ''}
            disabled
            placeholder={t('mosques.form.members.idNumber')}
            className="text-lg tracking-wide"
          />
        </div>

        {member.membership && !REQUIRED_MEMBERSHIPS.includes(member.membership) && (
          <div className="flex-1 h-[50px]">
            <Select disabled value={member.membership}>
              <SelectTrigger>
                <SelectValue>
                  {t(`mosques.form.members.memberships.${member.membership}`)}
                </SelectValue>
              </SelectTrigger>
            </Select>
          </div>
        )}

        <div className="flex gap-2 shrink-0 h-[50px]">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleEditClick(member)}
          >
            {t('common.edit')}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setMemberToDelete(member)}
            disabled={isSubmitting || (member.membership && REQUIRED_MEMBERSHIPS.includes(member.membership))}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Split the ID number field renderer for each form type
  const renderMemberIdNumberField = (
    form: ReturnType<typeof useForm<MemberFormValues>>,
    isDisabled = false
  ) => (
    <FormField
      control={form.control}
      name="id_number"
      render={({ field, fieldState }) => (
        <FormItem className="flex-1 h-[50px]">
          <div className="relative">
            <FormControl>
              <Input 
                {...field}
                disabled={isDisabled}
                value={formatIdNumber(field.value) || ''}
                onChange={(e) => handleMemberIdNumberChange(e, form)}
                placeholder={t('mosques.form.members.idNumber')}
                className={cn(
                  "text-lg tracking-wide h-10",
                  fieldState.error && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={10}
              />
            </FormControl>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  variants={errorAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-destructive text-sm absolute w-full"
                >
                  {fieldState.error.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormItem>
      )}
    />
  );

  // Update the main member form renderer
  const renderMainMemberForm = (position: MembershipType) => {
    const form = mainMemberForms[position as keyof typeof mainMemberForms];
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleMainMemberSubmit(position, data))} 
              className="flex items-center gap-4">
          {renderMainMemberFormField(form, 'name', t('mosques.form.members.name'))}
          {renderMainMemberFormField(form, 'phone', '', false, 'phone')}
          {renderMainMemberIdNumberField(form)}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('mosques.form.members.addMember')}
          </Button>
        </form>
      </Form>
    );
  };

  // Split the ID number field renderer for each form type
  const renderMainMemberIdNumberField = (
    form: ReturnType<typeof useForm<MainMemberFormValues>>,
    isDisabled = false
  ) => (
    <FormField
      control={form.control}
      name="id_number"
      render={({ field, fieldState }) => (
        <FormItem className="flex-1 h-[50px]">
          <div className="relative">
            <FormControl>
              <Input 
                {...field}
                disabled={isDisabled}
                value={formatIdNumber(field.value) || ''}
                onChange={(e) => handleMainMemberIdNumberChange(e, form)}
                placeholder={t('mosques.form.members.idNumber')}
                className={cn(
                  "text-lg tracking-wide h-10",
                  fieldState.error && "border-destructive focus-visible:ring-destructive"
                )}
                maxLength={10}
              />
            </FormControl>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  variants={errorAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-destructive text-sm absolute w-full"
                >
                  {fieldState.error.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormItem>
      )}
    />
  );

  // Add the membership field renderer
  const renderMembershipField = (
    form: ReturnType<typeof useForm<MemberFormValues>>,
    isDisabled = false
  ) => (
    <FormField
      control={form.control}
      name="membership"
      render={({ field, fieldState }) => (
        <FormItem className="flex-1 h-[50px]">
          <div className="relative">
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={isDisabled}
            >
              <FormControl>
                <SelectTrigger className={cn(
                  "h-10",
                  fieldState.error && "border-destructive focus-visible:ring-destructive"
                )}>
                  <SelectValue placeholder={t('mosques.form.members.selectMembership')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(['nazir2', 'volunteer', 'permanent_volunteer'] as const).map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`mosques.form.members.memberships.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AnimatePresence mode="wait">
              {fieldState.error && (
                <motion.div
                  variants={errorAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-destructive text-sm absolute w-full"
                >
                  {fieldState.error.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormItem>
      )}
    />
  );

  return (
    <>
      <div className="space-y-6">
        {/* Main Members Section */}
        <div>
          <div className="space-y-4">
            {REQUIRED_MEMBERSHIPS.map((position) => {
              const member = members.find(m => m.membership === position);
              return (
                <div key={position} className="space-y-2">
                  <h3 className="font-medium">
                    {t(`mosques.form.members.memberships.${position}`)}
                  </h3>
                  {member ? (
                    renderMemberForm(member, editingMemberId === member.id)
                  ) : (
                    renderMainMemberForm(position)
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Additional Members Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t('mosques.form.members.additionalMembers')}
          </h2>
          


          {/* Updated Members List */}
          <div className="mt-6 space-y-4">
            {members
              .filter(member => member.membership && !REQUIRED_MEMBERSHIPS.includes(member.membership))
              .map((member) => (
                <div key={member.id} className="border-b pb-4">
                  {renderMemberForm(member, editingMemberId === member.id)}
                </div>
              ))}
          </div>
          <Form {...additionalMemberForm}>
            <form onSubmit={additionalMemberForm.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center mt-4 gap-4 h-[50px]">
                {renderMemberFormField(additionalMemberForm, 'name', t('mosques.form.members.name'))}
                {renderMemberFormField(additionalMemberForm, 'phone', '', false, 'phone')}
                {renderMemberIdNumberField(additionalMemberForm)}
                {renderMembershipField(additionalMemberForm)}
                <div className="flex gap-2 h-[50px]">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Plus className="mr-2 h-4 w-4" />
                  {t('mosques.form.members.addMember')}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

        </div>

        <div className="flex justify-end gap-4 h-[50px]">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/mosques")}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleFinish} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.finish')}
          </Button>
        </div>
      </div>

      {/* Add the AlertDialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('mosques.form.members.deleteConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToDelete && handleDelete(memberToDelete)}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 