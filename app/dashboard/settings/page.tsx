"use client";

import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({
    name: "Demo Restaurant",
    email: "demo@restaurant.com",
    phone: "123-456-7890",
    address: "123 Main St, City, Country",
  });

  return (
    <>
      <SiteHeader title="Settings" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6 max-w-xl">
          <h2 className="text-xl font-bold mb-4">Restaurant Settings</h2>
          <div className="flex flex-col gap-4">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Restaurant Name"
            />
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Email"
            />
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="Phone"
            />
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Address"
            />
            <Button className="mt-2">Save Changes</Button>
          </div>
        </div>
      </div>
    </>
  );
}
