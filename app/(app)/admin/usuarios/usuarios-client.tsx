"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { mockUsuarios } from "@/lib/mocks";
import type { Perfil, Role } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";

const ROLES: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "entrevistador", label: "Entrevistador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "vigilancia", label: "Vigilância" },
];

const ROLE_VARIANT: Record<
  Role,
  "default" | "secondary" | "outline" | "destructive"
> = {
  admin: "default",
  entrevistador: "secondary",
  recepcionista: "outline",
  vigilancia: "outline",
};

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "entrevistador", "recepcionista", "vigilancia"]),
});
type FormData = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export function UsuariosClient() {
  const [items, setItems] = useState<Perfil[]>(mockUsuarios);
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Perfil | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Perfil | null>(null);
  const [roleValue, setRoleValue] = useState<Role>("entrevistador");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const filtered = useMemo(
    () =>
      items.filter(
        (u) =>
          u.nome.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    const defaultRole: Role = "entrevistador";
    setRoleValue(defaultRole);
    reset({ nome: "", email: "", role: defaultRole });
    setDialogOpen(true);
  }

  function openEdit(item: Perfil) {
    setEditing(item);
    setRoleValue(item.role);
    reset({ nome: item.nome, email: item.email, role: item.role });
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open && !saving) {
      setDialogOpen(false);
      setEditing(null);
      setRoleValue("entrevistador");
      reset({ nome: "", email: "", role: "entrevistador" });
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      if (editing) {
        setItems((prev) =>
          prev.map((u) => (u.id === editing.id ? { ...u, ...data } : u))
        );
        toast.success("Usuário atualizado com sucesso.");
      } else {
        const newItem: Perfil = {
          id: `u${Date.now()}`,
          nome: data.nome,
          email: data.email,
          role: data.role,
          ativo: true,
          criado_em: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
        toast.success("Usuário criado com sucesso.");
      }
      setDialogOpen(false);
      setEditing(null);
      setRoleValue("entrevistador");
      reset({ nome: "", email: "", role: "entrevistador" });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast.success("Usuário excluído.");
    setDeleteTarget(null);
  }

  function getRoleLabel(role: Role) {
    return ROLES.find((r) => r.value === role)?.label ?? role;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Gerenciamento de usuários e perfis de acesso"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            Novo usuário
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-8"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-10"
                    >
                      {search
                        ? "Nenhum usuário encontrado para a busca."
                        : "Nenhum usuário cadastrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[item.role]}>
                          {getRoleLabel(item.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.ativo ? "default" : "outline"}>
                          {item.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <RowActions
                          onEdit={() => openEdit(item)}
                          onDelete={() => setDeleteTarget(item)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar usuário" : "Novo usuário"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-nome">Nome completo</Label>
              <Input
                id="u-nome"
                {...register("nome")}
                placeholder="Ex: Ana Souza"
                aria-invalid={!!errors.nome}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-email">E-mail</Label>
              <Input
                id="u-email"
                type="email"
                {...register("email")}
                placeholder="ana@caarapo.ms.gov.br"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Perfil de acesso</Label>
              <div className="w-full">
                <Select
                  value={roleValue}
                  onValueChange={(v) => {
                    if (!v) return;
                    const role = v as Role;
                    setRoleValue(role);
                    setValue("role", role, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.role}>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.role && (
                <p className="text-xs text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => handleDialogClose(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2Icon className="animate-spin" />}
                {editing ? "Salvar alterações" : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nome}
      />
    </div>
  );
}
