'use client'

import { OverviewCards } from "@/components/modules/dashboard/analytics/overview-cards"
import { MosqueActivityChart } from "@/components/modules/dashboard/analytics/mosque-activity-chart"
import { RecentEvents } from "@/components/modules/dashboard/analytics/recent-events"
import { DonationStats } from "@/components/modules/dashboard/analytics/donation-stats"

export function Overview() {
  return (
    <>
      <OverviewCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <MosqueActivityChart />
        <RecentEvents />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <DonationStats />
      </div>
    </>
  )
} 