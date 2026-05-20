import { VolunteerFormValues } from "./schema";

// Define the FormField type
interface FormFieldOption {
  value: string;
  label: string;
}

// Add export to the FormField interface
export interface FormField<T> {
  name: keyof T;
  type: 'text' | 'select' | 'datetime' | 'number' | 'textarea' | 'tags' | 'switch';
  label: string;
  placeholder?: string;
  options?: FormFieldOption[];
  condition?: (values: T) => boolean;
}

// Also export FormFieldOption if needed elsewhere
export type { FormFieldOption };

export const volunteerFormFields: FormField<VolunteerFormValues>[] = [
  {
    name: "title",
    type: "text",
    label: "volunteers.form.title",
    placeholder: "volunteers.form.titlePlaceholder",
  },
  {
    name: "type",
    type: "select",
    label: "volunteers.form.type",
    options: [
      { value: "volunteer", label: "volunteers.types.volunteer" },
      { value: "training", label: "volunteers.types.training" },
    ],
  },
  {
    name: "start_at",
    type: "datetime",
    label: "volunteers.form.startAt",
  },
  {
    name: "end_at",
    type: "datetime",
    label: "volunteers.form.endAt",
  },
  {
    name: "gender",
    type: "select",
    label: "volunteers.form.gender",
    options: [
      { value: "male", label: "volunteers.gender.male" },
      { value: "female", label: "volunteers.gender.female" },
      { value: "all", label: "volunteers.gender.all" },
    ],
  },
  {
    name: "age_from",
    type: "number",
    label: "volunteers.form.ageFrom",
  },
  {
    name: "age_to",
    type: "number",
    label: "volunteers.form.ageTo",
  },
  {
    name: "description",
    type: "textarea",
    label: "volunteers.form.description",
    placeholder: "volunteers.form.descriptionPlaceholder",
  },
  {
    name: "requirements",
    type: "textarea",
    label: "volunteers.form.requirements",
    placeholder: "volunteers.form.requirementsPlaceholder",
  },
  {
    name: "skills",
    type: "tags",
    label: "volunteers.form.skills",
    placeholder: "volunteers.form.skillsPlaceholder",
  },
  {
    name: "has_financial_reward",
    type: "switch",
    label: "volunteers.form.hasFinancialReward",
  },
  {
    name: "reward_amount",
    type: "number",
    label: "volunteers.form.rewardAmount",
    condition: (values: VolunteerFormValues) => values.has_financial_reward,
  },
  {
    name: "has_certificate_reward",
    type: "switch",
    label: "volunteers.form.hasCertificateReward",
  },
  {
    name: "has_hours_reward",
    type: "switch",
    label: "volunteers.form.hasHoursReward",
  },
  {
    name: "volunteer_hours",
    type: "number",
    label: "volunteers.form.volunteerHours",
    condition: (values: VolunteerFormValues) => values.has_hours_reward,
  },
  {
    name: "has_training",
    type: "switch",
    label: "volunteers.form.hasTraining",
  },
  {
    name: "capacity",
    type: "number",
    label: "volunteers.form.capacity",
  },
  {
    name: "status",
    type: "select",
    label: "volunteers.form.status",
    options: [
      { value: "draft", label: "volunteers.status.draft" },
      { value: "open", label: "volunteers.status.open" },
      { value: "closed", label: "volunteers.status.closed" },
      { value: "cancelled", label: "volunteers.status.cancelled" },
      { value: "completed", label: "volunteers.status.completed" },
    ],
  },
  {
    name: "application_deadline",
    type: "datetime",
    label: "volunteers.form.applicationDeadline",
  },
];
