import {
  Home,
  Building,
  Building2,
  Tent,
  User,
  Landmark,
} from "lucide-react"

export const types = [
  {
    value: "jamee",
    label: "Jamee",
    icon: Building2,
  },
  {
    value: "masjed",
    label: "Masjed",
    icon: Building,
  },
  {
    value: "mosala",
    label: "Mosala",
    icon: Home,
  },
  {
    value: "temporary",
    label: "Temporary",
    icon: Tent,
  },
  {
    value: "other",
    label: "Other",
    icon: Building2,
  },
]

export const relatedTo = [
  {
    value: "awqaf",
    label: "Awqaf",
    icon: Building,
  },
  {
    value: "moia",
    label: "MOIA",
    icon: Landmark,
  },
  {
    value: "private",
    label: "Private",
    icon: User,
  },
]
