"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mockQRCodes = [
  { id: 1, menu: "Lunch Specials", qr: "/file.svg" },
  { id: 2, menu: "Dinner Menu", qr: "/file.svg" },
  { id: 3, menu: "Drinks", qr: "/file.svg" },
];

export default function Page() {
  return (
    <>
      <SidebarInset>
        <SiteHeader title="QR Codes" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <h2 className="text-xl font-bold mb-4">QR Codes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockQRCodes.map((qr) => (
                <div
                  key={qr.id}
                  className="bg-muted rounded-lg p-4 border border-border flex flex-col items-center gap-2"
                >
                  <img
                    src={qr.qr}
                    alt="QR Preview"
                    className="w-24 h-24 object-contain mb-2"
                  />
                  <div className="font-semibold text-lg">{qr.menu}</div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
