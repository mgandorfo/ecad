"use client";

import Link from "next/link";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface TopbarProps {
  user: Perfil;
  devRole?: Role;
  onDevRoleChange?: (role: Role) => void;
}

export function Topbar({ user, devRole, onDevRoleChange }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const initials = user.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b bg-background shrink-0">
      <Breadcrumbs />

      <div className="flex items-center gap-2">
        {onDevRoleChange && (
          <select
            className="text-xs border rounded px-2 py-1 bg-background text-muted-foreground"
            value={devRole}
            onChange={(e) => onDevRoleChange(e.target.value as Role)}
            title="Dev: trocar role"
          >
            <option value="admin">Admin</option>
            <option value="entrevistador">Entrevistador</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="vigilancia">Vigilância</option>
          </select>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="font-medium text-sm truncate">{user.nome}</div>
              <div className="text-xs text-muted-foreground">
                {roleLabels[user.role]}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/perfil" />}>
              <User className="size-4 mr-2" />
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
