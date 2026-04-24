import {
  LayoutDashboard,
  Users,
  Layers,
  Wrench,
  Activity,
  ClipboardList,
  ListChecks,
  BarChart2,
  FileText,
  UserCircle,
} from "lucide-react";
import type { Role } from "@/lib/types";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "entrevistador", "vigilancia"],
  },
  {
    label: "Fila de Atendimento",
    href: "/fila",
    icon: ClipboardList,
    roles: ["admin", "entrevistador"],
  },
  {
    label: "Meus Atendimentos",
    href: "/meus-atendimentos",
    icon: ListChecks,
    roles: ["entrevistador"],
  },
  {
    label: "Novo Atendimento",
    href: "/atendimentos/novo",
    icon: Activity,
    roles: ["admin", "entrevistador", "recepcionista"],
  },
  {
    label: "Beneficiários",
    href: "/beneficiarios",
    icon: Users,
    roles: ["admin", "entrevistador", "recepcionista"],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    roles: ["admin", "entrevistador", "vigilancia"],
  },
  {
    label: "Setores",
    href: "/admin/setores",
    icon: Layers,
    roles: ["admin"],
  },
  {
    label: "Serviços",
    href: "/admin/servicos",
    icon: Wrench,
    roles: ["admin"],
  },
  {
    label: "Status",
    href: "/admin/status",
    icon: BarChart2,
    roles: ["admin"],
  },
  {
    label: "Usuários",
    href: "/admin/usuarios",
    icon: UserCircle,
    roles: ["admin"],
  },
];
