"use client";

import Link from "next/link";
import { Moon, Sun, LogOut, User, FlaskConical } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "./breadcrumbs";
import type { Perfil, Role } from "@/lib/types";

const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  entrevistador: "Entrevistador",
  recepcionista: "Recepcionista",
  vigilancia: "Vigilância",
};

const roleColors: Record<Role, string> = {
  admin: "bg-destructive/15 text-destructive border-destructive/20",
  entrevistador: "bg-primary/15 text-primary border-primary/20",
  recepcionista: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  vigilancia: "bg-muted text-muted-foreground border-border",
};

interface TopbarProps {
  user: Perfil;
  devRole?: Role;
  onDevRoleChange?: (role: Role) => void;
  mobileSidebar?: React.ReactNode;
}

export function Topbar({ user, devRole, onDevRoleChange, mobileSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  const initials = user.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center h-14 border-b bg-background shrink-0 px-4 gap-3">
      {/* Hamburguer — visível só no mobile */}
      {mobileSidebar && (
        <div className="md:hidden shrink-0">{mobileSidebar}</div>
      )}

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Ações da direita */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Seletor de role (dev only) */}
        {onDevRoleChange && (
          <div className="hidden sm:flex items-center gap-1.5 border border-dashed border-amber-500/50 rounded-md px-2 py-1 bg-amber-500/5">
            <FlaskConical className="size-3 text-amber-500 shrink-0" />
            <select
              className="text-xs bg-transparent text-amber-600 dark:text-amber-400 outline-none cursor-pointer"
              value={devRole}
              onChange={(e) => onDevRoleChange(e.target.value as Role)}
              title="Dev: trocar role simulado"
            >
              <option value="admin">Admin</option>
              <option value="entrevistador">Entrevistador</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="vigilancia">Vigilância</option>
            </select>
          </div>
        )}

        {/* Toggle de tema */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="rounded-full size-9" />}
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="pb-2">
              <div className="font-semibold text-sm truncate">{user.nome}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</div>
              <Badge
                className={`mt-1.5 text-[10px] px-1.5 py-0 font-medium border ${roleColors[user.role]}`}
              >
                {roleLabels[user.role]}
              </Badge>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem render={<Link href="/perfil" />}>
              <User className="size-4 mr-2 text-muted-foreground" />
              Meu Perfil
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive">
              <LogOut className="size-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
