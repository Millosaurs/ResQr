"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const mockMetrics = [
    { label: "Scans This Month", value: 320 },
    { label: "Top Menu", value: "Lunch Specials" },
    { label: "Peak Time", value: "12:00-14:00" },
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
                <SiteHeader title="Analytics" />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-col gap-6 p-6">
                        <h2 className="text-xl font-bold mb-4">Analytics</h2>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            {mockMetrics.map((m) => (
                                <div key={m.label} className="bg-muted rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-foreground">{m.value}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-card rounded-lg p-8 border border-border flex items-center justify-center min-h-[200px]">
                            <span className="text-muted-foreground">[Chart Placeholder]</span>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
} 