'use client'

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/providers/language-provider"

const chartData = [
  { month: "January", events: 40, attendance: 240, donations: 140 },
  { month: "February", events: 30, attendance: 139, donations: 980 },
  { month: "March", events: 20, attendance: 980, donations: 390 },
  { month: "April", events: 27, attendance: 390, donations: 480 },
  { month: "May", events: 18, attendance: 480, donations: 380 },
  { month: "June", events: 23, attendance: 380, donations: 430 },
]

export function MosqueActivityChart() {
  const { t } = useLanguage()

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t('prayer.info.monthlyEvents')}</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="events"
                name={t('prayer.events.title')}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                name={t('prayer.events.attendees')}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="donations"
                name={t('prayer.donate.title')}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {t('common.activityIncrease')} 15.2% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {t('common.showingLast6Months')}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}