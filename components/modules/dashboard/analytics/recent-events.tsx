'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/providers/language-provider"

const recentEvents = [
  {
    id: 1,
    name: "Ramadan Iftar Gathering",
    mosque: "Al-Noor Mosque",
    date: "2024-03-15",
    attendees: 150,
    image: "/mosques/al-noor.jpg"
  },
  {
    id: 2,
    name: "Islamic Studies Workshop",
    mosque: "Al-Rahman Mosque",
    date: "2024-03-14",
    attendees: 75,
    image: "/mosques/al-rahman.jpg"
  },
  {
    id: 3,
    name: "Community Service Day",
    mosque: "Al-Huda Center",
    date: "2024-03-13",
    attendees: 45,
    image: "/mosques/al-huda.jpg"
  },
  {
    id: 4,
    name: "Youth Program",
    mosque: "Islamic Center",
    date: "2024-03-12",
    attendees: 90,
    image: "/mosques/islamic-center.jpg"
  },
  {
    id: 5,
    name: "Friday Prayer",
    mosque: "Al-Salam Mosque",
    date: "2024-03-11",
    attendees: 200,
    image: "/mosques/al-salam.jpg"
  }
]

export function RecentEvents() {
  const { t } = useLanguage()

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t('prayer.events.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentEvents.map((event) => (
            <div key={event.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                {/* <AvatarImage src={event.image} alt={event.mosque} /> */}
                <AvatarFallback>{event.mosque.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {event.mosque}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {event.attendees} {t('prayer.events.attendees')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}