"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileSidebar } from "./mobile-sidebar";
import type { Perfil, Role } from "@/lib/types";
import { mockUsuarios } from "@/lib/mocks/usuarios";

const DEV_USER: Perfil = mockUsuarios[0];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [devRole, setDevRole] = useState<Role>(DEV_USER.role);
  const currentUser: Perfil = { ...DEV_USER, role: devRole };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — visível só em md+ */}
      <div className="hidden md:flex">
        <Sidebar role={devRole} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          user={currentUser}
          devRole={devRole}
          onDevRoleChange={setDevRole}
          mobileSidebar={<MobileSidebar role={devRole} />}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
