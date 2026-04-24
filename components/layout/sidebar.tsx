"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import type { Role } from "@/lib/types";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r bg-sidebar h-full">
      <div className="flex items-center gap-2 px-5 h-14 border-b">
        <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
          E-CAD
        </span>
        <span className="text-xs text-muted-foreground">v0.1</span>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
