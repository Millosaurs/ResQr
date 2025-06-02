"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const mockSummary = [
  { label: "Total Menus", value: 3 },
  { label: "Total Scans", value: 1240 },
  { label: "Avg. Rating", value: 4.7 },
  { label: "Subscription", value: "Pro" },
]

const mockActivity = [
  { id: 1, text: "Menu 'Lunch Specials' updated", time: "2h ago" },
  { id: 2, text: "QR code downloaded", time: "4h ago" },
  { id: 3, text: "New menu created: 'Drinks'", time: "1d ago" },
]

export default function Page() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as any}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockSummary.map((item) => (
                <div key={item.label} className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="font-semibold mb-2">Recent Activity</div>
              <ul className="space-y-2">
                {mockActivity.map((a) => (
                  <li key={a.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{a.text}</span>
                    <span className="text-xs">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
