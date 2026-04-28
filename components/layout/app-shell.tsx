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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium"
      >
        Pular para o conteúdo
      </a>
      <div className="flex h-dvh overflow-hidden bg-background">
        <div className="hidden md:flex">
          <Sidebar role={user.role} />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar
            user={user}
            mobileSidebar={<MobileSidebar role={user.role} />}
          />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
