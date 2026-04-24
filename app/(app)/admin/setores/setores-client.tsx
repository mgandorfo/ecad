"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusIcon, SearchIcon } from "lucide-react";

import { mockSetores } from "@/lib/mocks";
import type { Setor } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";

const schema = z.object({
  codigo: z.string().min(1, "Código obrigatório").max(10, "Máximo 10 caracteres"),
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
});
type FormData = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export function SetoresClient() {
  const [items, setItems] = useState<Setor[]>(mockSetores);
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Setor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Setor | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const filtered = useMemo(
    () =>
      items.filter(
        (s) =>
          s.nome.toLowerCase().includes(search.toLowerCase()) ||
          s.codigo.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    reset({ codigo: "", nome: "" });
    setDialogOpen(true);
  }

  function openEdit(item: Setor) {
    setEditing(item);
    reset({ codigo: item.codigo, nome: item.nome });
    setDialogOpen(true);
  }

  function onSubmit(data: FormData) {
    if (editing) {
      setItems((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
      );
      toast.success("Setor atualizado com sucesso.");
    } else {
      const newItem: Setor = {
        id: `s${Date.now()}`,
        codigo: data.codigo,
        nome: data.nome,
        ativo: true,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Setor criado com sucesso.");
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success("Setor excluído.");
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Setores"
        description="Gerenciamento de setores de atendimento"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            Novo setor
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por código ou nome..."
          className="pl-8"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      {search ? "Nenhum setor encontrado para a busca." : "Nenhum setor cadastrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.codigo}</TableCell>
                      <TableCell>{item.nome}</TableCell>
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
                {filtered.length} setor{filtered.length !== 1 ? "es" : ""}
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

      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar setor" : "Novo setor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" {...register("codigo")} placeholder="Ex: BPC" />
              {errors.codigo && (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" {...register("nome")} placeholder="Ex: BPC - Benefício de Prestação Continuada" />
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editing ? "Salvar alterações" : "Criar setor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nome}
      />
    </div>
  );
}
