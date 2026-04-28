"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileSidebar } from "./mobile-sidebar";
import type { Perfil } from "@/lib/types";
import { RoleProvider } from "@/lib/role-context";

interface AppShellProps {
  user: Perfil;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <RoleProvider role={user.role}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <div className="hidden md:flex">
          <Sidebar role={user.role} />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            user={user}
            mobileSidebar={<MobileSidebar role={user.role} />}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
