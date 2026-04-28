"use client";

import Link from "next/link";
import { Moon, Sun, LogOut, User } from "lucide-react";
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
import { signOut } from "@/app/actions/auth";
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
  mobileSidebar?: React.ReactNode;
}

export function Topbar({ user, mobileSidebar }: TopbarProps) {
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
      {mobileSidebar && (
        <div className="md:hidden shrink-0">{mobileSidebar}</div>
      )}

      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
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

            <DropdownMenuItem
              variant="destructive"
              onSelect={() => signOut()}
            >
              <LogOut className="size-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
