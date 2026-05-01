"use client";

import Link from "next/link";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "./breadcrumbs";
import { signOut } from "@/app/actions/auth";
import type { Perfil, Role } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  entrevistador: "Entrevistador",
  recepcionista: "Recepcionista",
  vigilancia: "Vigilância",
};

const roleVariant: Record<Role, "role-admin" | "role-entrevistador" | "role-recepcionista" | "role-vigilancia"> = {
  admin: "role-admin",
  entrevistador: "role-entrevistador",
  recepcionista: "role-recepcionista",
  vigilancia: "role-vigilancia",
};

interface TopbarProps {
  user: Perfil;
  mobileSidebar?: React.ReactNode;
}

export function Topbar({ user, mobileSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [signingOut, startSignOut] = useTransition();
  const router = useRouter();

  const initials = user.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-center h-14 border-b border-border/80 bg-background/95 backdrop-blur-sm shrink-0 px-4 gap-3">
      {mobileSidebar && (
        <div className="md:hidden shrink-0">{mobileSidebar}</div>
      )}

      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Alternar tema"
                className="text-muted-foreground hover:text-foreground"
              />
            }
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </TooltipTrigger>
          <TooltipContent>Alternar tema</TooltipContent>
        </Tooltip>

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
            <DropdownMenuGroup>
              <DropdownMenuLabel className="pb-2">
                <div className="font-semibold text-sm truncate">{user.nome}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</div>
                <Badge
                  variant={roleVariant[user.role]}
                  className="mt-1.5"
                >
                  {roleLabels[user.role]}
                </Badge>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <User className="size-4 mr-2 text-muted-foreground" />
                Meu Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                disabled={signingOut}
                onClick={() => startSignOut(() => { void signOut(); })}
              >
                <LogOut className="size-4 mr-2" />
                {signingOut ? "Saindo…" : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
