"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const mockMenus = [
    { id: 1, name: "Lunch Specials", desc: "Weekday lunch menu", status: "Active" },
    { id: 2, name: "Dinner Menu", desc: "Evening menu", status: "Inactive" },
    { id: 3, name: "Drinks", desc: "Beverages and cocktails", status: "Active" },
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
                <SiteHeader title="Menus" />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-col gap-6 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Menus</h2>
                            <Button size="sm">Create Menu</Button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockMenus.map((menu) => (
                                <div key={menu.id} className="bg-muted rounded-lg p-4 border border-border flex flex-col gap-2">
                                    <div className="font-semibold text-lg">{menu.name}</div>
                                    <div className="text-sm text-muted-foreground">{menu.desc}</div>
                                    <div className="text-xs mt-2">Status: <span className={menu.status === "Active" ? "text-green-600" : "text-red-600"}>{menu.status}</span></div>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline">Edit</Button>
                                        <Button size="sm" variant="outline">Download QR</Button>
                                        <Button size="sm" variant="outline">Preview</Button>
                                        <Button size="sm" variant="destructive">Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
} 