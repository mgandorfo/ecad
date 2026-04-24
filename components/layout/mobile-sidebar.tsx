"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { Role } from "@/lib/types";

interface MobileSidebarProps {
  role: Role;
}

export function MobileSidebar({ role }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-60 sm:w-60 sm:max-w-none" showCloseButton={false}>
        <Sidebar role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
