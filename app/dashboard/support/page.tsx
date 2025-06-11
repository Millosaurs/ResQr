"use client";

import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({
    email: "",
    message: "",
  });

  return (
    <>
      <SiteHeader title="Support" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6 max-w-xl">
          <h2 className="text-xl font-bold mb-4">Support</h2>
          <div className="flex flex-col gap-4">
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Your Email"
            />
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder="How can we help you?"
              className="rounded-md border border-border bg-background p-2 min-h-[100px]"
            />
            <Button className="mt-2">Submit</Button>
          </div>
        </div>
      </div>
    </>
  );
}
