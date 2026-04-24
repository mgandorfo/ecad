"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import { Logo } from "./logo";
import type { Role } from "@/lib/types";

interface SidebarProps {
  role: Role;
  onNavigate?: () => void;
}

const adminItems = ["Setores", "Serviços", "Status", "Usuários"];

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const filtered = navItems.filter((item) => item.roles.includes(role));
  const mainItems = filtered.filter((item) => !adminItems.includes(item.label));
  const adminNavItems = filtered.filter((item) => adminItems.includes(item.label));

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-full">
      <div className="flex items-center px-4 h-14 border-b border-sidebar-border shrink-0">
        <Logo size="sm" />
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto p-2 gap-0.5">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}

        {adminNavItems.length > 0 && (
          <div className="mt-4">
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
              Administração
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border shrink-0">
        <p className="text-[10px] text-sidebar-foreground/30 text-center">
          Prefeitura Municipal de Caarapo - MS
        </p>
      </div>
    </aside>
  );
}
