"use client";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon, ToggleLeftIcon, ToggleRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  ativo?: boolean;
  onToggleAtivo?: () => void;
}

export function RowActions({ onEdit, onDelete, ativo, onToggleAtivo }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Ações" />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <PencilIcon />
          Editar
        </DropdownMenuItem>
        {onToggleAtivo && (
          <DropdownMenuItem onClick={onToggleAtivo}>
            {ativo ? <ToggleLeftIcon /> : <ToggleRightIcon />}
            {ativo ? "Desativar" : "Ativar"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
