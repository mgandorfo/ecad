"use client";

import { useRole } from "@/lib/role-context";
import { RoleGuard } from "@/components/layout/role-guard";

export function BeneficiarioGuard({ children }: { children: React.ReactNode }) {
  const role = useRole();
  return (
    <RoleGuard roles={["admin", "entrevistador", "recepcionista"]} currentRole={role}>
      {children}
    </RoleGuard>
  );
}
