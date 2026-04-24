"use client";

import { useRole } from "@/lib/role-context";
import { RoleGuard } from "@/components/layout/role-guard";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const role = useRole();
  return (
    <RoleGuard roles={["admin"]} currentRole={role}>
      {children}
    </RoleGuard>
  );
}
