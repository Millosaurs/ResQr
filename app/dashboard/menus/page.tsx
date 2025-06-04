"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Download, Eye, Trash } from "lucide-react";

const initialMenus = [
  {
    id: 1,
    name: "Lunch Specials",
    desc: "Weekday lunch menu",
    status: "Active",
  },
  { id: 2, name: "Dinner Menu", desc: "Evening menu", status: "Inactive" },
  { id: 3, name: "Drinks", desc: "Beverages and cocktails", status: "Active" },
];

export default function Page() {
  const [menus, setMenus] = useState(initialMenus);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", status: "Active" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setForm({ ...form, status: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMenus([...menus, { id: Date.now(), ...form }]);
    setForm({ name: "", desc: "", status: "Active" });
    setOpen(false);
  };

  return (
    <>
      <SiteHeader title="Menus" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Menus</h2>
            <Button size="sm" onClick={() => setOpen(true)}>
              Create Menu
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-muted rounded-lg p-4 border border-border flex flex-col gap-2"
              >
                <div className="font-semibold text-lg">{menu.name}</div>
                <div className="text-sm text-muted-foreground">{menu.desc}</div>
                <div className="text-xs mt-2">
                  Status:{" "}
                  <span
                    className={
                      menu.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {menu.status}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex flex-col items-center justify-center"
                  >
                    <Pencil className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex flex-col items-center justify-center"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex flex-col items-center justify-center"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex flex-col items-center justify-center text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Create New Menu</DialogTitle>
            </DialogHeader>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Menu Name"
              required
            />
            <Input
              name="desc"
              value={form.desc}
              onChange={handleChange}
              placeholder="Description"
            />
            <Select value={form.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit">Create</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
