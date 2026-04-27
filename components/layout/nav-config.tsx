import {
  LayoutDashboard,
  Users,
  Layers,
  Wrench,
  ClipboardList,
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
    label: "Atendimentos",
    href: "/atendimentos",
    icon: ClipboardList,
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
