"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  fila: "Fila de Atendimento",
  atendimentos: "Atendimentos",
  "meus-atendimentos": "Meus Atendimentos",
  beneficiarios: "Beneficiários",
  relatorios: "Relatórios",
  admin: "Administração",
  setores: "Setores",
  servicos: "Serviços",
  status: "Status",
  usuarios: "Usuários",
  perfil: "Meu Perfil",
  novo: "Novo",
};

function isId(segment: string) {
  return /^[a-z0-9_-]{2,}$/i.test(segment) && !routeLabels[segment];
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = routeLabels[segment] ?? (isId(segment) ? "Detalhes" : segment);
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
