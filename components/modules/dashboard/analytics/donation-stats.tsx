'use client'

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/providers/language-provider"

const chartData = [
  { month: "January", orders: 186, donators: 80 },
  { month: "February", orders: 305, donators: 200 },
  { month: "March", orders: 237, donators: 120 },
  { month: "April", orders: 273, donators: 190 },
  { month: "May", orders: 309, donators: 230 },
  { month: "June", orders: 314, donators: 240 },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--color-orders)",
  },
  donators: {
    label: "Donators",
    color: "var(--color-donators)",
  },
}

export function DonationStats() {
  const { t } = useLanguage()

  return (
    <Card className="col-span-4 [--color-orders:hsl(var(--chart-1))] [--color-donators:hsl(var(--chart-2))]">
      <CardHeader>
        <CardTitle>{t('prayer.donate.title')}</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar 
                dataKey="orders" 
                name={t('prayer.donate.donors')}
                fill={chartConfig.orders.color}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="donators" 
                name={t('prayer.donate.totalDonors')}
                fill={chartConfig.donators.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {t('common.trending')} 8.4% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {t('common.showingLast6Months')}
        </div>
      </CardFooter>
    </Card>
  )
} 