"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mockUser = {
  name: "Jane Doe",
  email: "jane@demo.com",
  subscription: "Pro",
};

export default function Page() {
  return (
    <>
      <SiteHeader title="Account" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6 max-w-xl">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="bg-muted rounded-lg p-4 border border-border flex flex-col gap-2">
            <div>
              <span className="font-semibold">Name:</span> {mockUser.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {mockUser.email}
            </div>
            <div>
              <span className="font-semibold">Subscription:</span>{" "}
              {mockUser.subscription}
            </div>
            <Button className="mt-2">Manage Billing</Button>
          </div>
        </div>
      </div>
    </>
  );
}
