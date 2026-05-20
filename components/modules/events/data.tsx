import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";

export const statuses = [
  {
    value: "draft",
    label: "Draft",
    label_ar: "مسودة",
    icon: Calendar,
  },
  {
    value: "published",
    label: "Published",
    label_ar: "منشورة",
    icon: Clock,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    label_ar: "ملغية",
    icon: XCircle,
  },
  {
    value: "completed",
    label: "Completed",
    label_ar: "منجزة",
    icon: CheckCircle2,
  },
] as const;

export type EventStatus = typeof statuses[number]['value'];