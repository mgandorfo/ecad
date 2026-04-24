import { ShieldOff } from "lucide-react";
import type { Role } from "@/lib/types";

interface RoleGuardProps {
  roles: Role[];
  currentRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const defaultFallback = (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
    <ShieldOff className="size-10 opacity-30" />
    <p className="text-sm font-medium">Acesso não autorizado</p>
    <p className="text-xs">Você não tem permissão para visualizar este conteúdo.</p>
  </div>
);

export function RoleGuard({ roles, currentRole, children, fallback }: RoleGuardProps) {
  if (!roles.includes(currentRole)) {
    return <>{fallback ?? defaultFallback}</>;
  }
  return <>{children}</>;
}
