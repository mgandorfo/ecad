"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react";

import type { Perfil, Role } from "@/lib/types";
import { convidarUsuario, atualizarUsuario, excluirUsuario } from "./actions";
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
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { EmptyState } from "@/components/ui/empty-state";

const ROLES: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "entrevistador", label: "Entrevistador" },
  { value: "recepcionista", label: "Recepcionista" },
  { value: "vigilancia", label: "Vigilância" },
];

const ROLE_VARIANT: Record<Role, "role-admin" | "role-entrevistador" | "role-recepcionista" | "role-vigilancia"> = {
  admin: "role-admin",
  entrevistador: "role-entrevistador",
  recepcionista: "role-recepcionista",
  vigilancia: "role-vigilancia",
};

const createSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "entrevistador", "recepcionista", "vigilancia"]),
});

const updateSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  role: z.enum(["admin", "entrevistador", "recepcionista", "vigilancia"]),
});

type CreateData = z.infer<typeof createSchema>;
type UpdateData = z.infer<typeof updateSchema>;

const PAGE_SIZE = 10;

interface Props {
  initialItems: Perfil[];
  initialTotal: number;
}

export function UsuariosClient({ initialItems, initialTotal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Perfil | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Perfil | null>(null);
  const [roleValue, setRoleValue] = useState<Role>("entrevistador");

  const createForm = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: { nome: "", email: "", role: "entrevistador" },
  });

  const updateForm = useForm<UpdateData>({
    resolver: zodResolver(updateSchema),
    defaultValues: { nome: "", role: "entrevistador" },
  });

  const totalPages = Math.max(1, Math.ceil(initialTotal / PAGE_SIZE));

  function getRoleLabel(role: Role) {
    return ROLES.find((r) => r.value === role)?.label ?? role;
  }

  function openCreate() {
    setEditing(null);
    setRoleValue("entrevistador");
    createForm.reset({ nome: "", email: "", role: "entrevistador" });
    setDialogOpen(true);
  }

  function openEdit(item: Perfil) {
    setEditing(item);
    setRoleValue(item.role);
    updateForm.reset({ nome: item.nome, role: item.role });
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open && !isPending) {
      setDialogOpen(false);
      setEditing(null);
      setRoleValue("entrevistador");
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      params.set("page", "1");
      router.replace(`/admin/usuarios?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("page", String(newPage));
      router.replace(`/admin/usuarios?${params.toString()}`);
    });
  }

  async function onSubmitCreate(data: CreateData) {
    startTransition(async () => {
      const result = await convidarUsuario(data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Usuário criado. Um e-mail de acesso foi enviado.");
      setDialogOpen(false);
      router.refresh();
    });
  }

  async function onSubmitUpdate(data: UpdateData) {
    if (!editing) return;
    startTransition(async () => {
      const result = await atualizarUsuario(editing.id, data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Usuário atualizado com sucesso.");
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await excluirUsuario(deleteTarget.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Usuário excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Gerenciamento de usuários e perfis de acesso"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon aria-hidden="true" />
            Convidar usuário
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-8"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
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
            {initialItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={<UsersIcon className="size-5" />}
                    title={search ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                    description={search ? `Nenhum resultado para "${search}".` : 'Crie o primeiro usuário clicando em "Novo usuário".'}
                  />
                </TableCell>
              </TableRow>
            ) : (
              initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[item.role]}>{getRoleLabel(item.role)}</Badge>
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
          <span>{initialTotal} usuário{initialTotal !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1 || isPending} onClick={() => handlePageChange(page - 1)}>
              Anterior
            </Button>
            <span>{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages || isPending} onClick={() => handlePageChange(page + 1)}>
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de criar */}
      {!editing && (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar usuário</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Um e-mail será enviado com o link para o usuário definir sua senha.
              </p>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-nome">Nome completo</Label>
                <Input
                  id="u-nome"
                  {...createForm.register("nome")}
                  placeholder="Ex: Ana Souza"
                  aria-invalid={!!createForm.formState.errors.nome}
                />
                {createForm.formState.errors.nome && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="u-email">E-mail</Label>
                <Input
                  id="u-email"
                  type="email"
                  {...createForm.register("email")}
                  placeholder="ana@caarapo.ms.gov.br"
                  aria-invalid={!!createForm.formState.errors.email}
                />
                {createForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Perfil de acesso</Label>
                <Select
                  value={roleValue}
                  onValueChange={(v) => {
                    const role = v as Role;
                    setRoleValue(role);
                    createForm.setValue("role", role, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!createForm.formState.errors.role}>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.role && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.role.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={isPending} onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2Icon className="animate-spin" />}
                  Enviar convite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de editar */}
      {editing && (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ue-nome">Nome completo</Label>
                <Input
                  id="ue-nome"
                  {...updateForm.register("nome")}
                  placeholder="Ex: Ana Souza"
                  aria-invalid={!!updateForm.formState.errors.nome}
                />
                {updateForm.formState.errors.nome && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>E-mail</Label>
                <Input value={editing.email} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Perfil de acesso</Label>
                <Select
                  value={roleValue}
                  onValueChange={(v) => {
                    const role = v as Role;
                    setRoleValue(role);
                    updateForm.setValue("role", role, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!updateForm.formState.errors.role}>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateForm.formState.errors.role && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.role.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={isPending} onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2Icon className="animate-spin" />}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nome}
      />
    </div>
  );
}
