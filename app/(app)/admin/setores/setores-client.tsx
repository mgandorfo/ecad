"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import type { Setor } from "@/lib/types";
import { criarSetor, atualizarSetor, excluirSetor } from "./actions";
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
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";

const schema = z.object({
  codigo: z.string().min(1, "Código obrigatório").max(10, "Máximo 10 caracteres"),
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
});
type FormData = z.infer<typeof schema>;

const PAGE_SIZE = 10;

interface Props {
  initialItems: Setor[];
  initialTotal: number;
}

export function SetoresClient({ initialItems, initialTotal }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Setor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Setor | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const totalPages = Math.max(1, Math.ceil(initialTotal / PAGE_SIZE));

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

  function handleDialogClose(open: boolean) {
    if (!open && !isPending) {
      setDialogOpen(false);
      setEditing(null);
      reset({ codigo: "", nome: "" });
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      params.set("page", "1");
      router.replace(`/admin/setores?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("page", String(newPage));
      router.replace(`/admin/setores?${params.toString()}`);
    });
  }

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = editing
        ? await atualizarSetor(editing.id, data)
        : await criarSetor(data);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(editing ? "Setor atualizado com sucesso." : "Setor criado com sucesso.");
      setDialogOpen(false);
      setEditing(null);
      reset({ codigo: "", nome: "" });
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await excluirSetor(deleteTarget.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Setor excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
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
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

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
            {initialItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  {search ? "Nenhum setor encontrado para a busca." : "Nenhum setor cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              initialItems.map((item) => (
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
          <span>{initialTotal} setor{initialTotal !== 1 ? "es" : ""}</span>
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar setor" : "Novo setor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                {...register("codigo")}
                placeholder="Ex: BPC"
                aria-invalid={!!errors.codigo}
              />
              {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                {...register("nome")}
                placeholder="Ex: BPC - Benefício de Prestação Continuada"
                aria-invalid={!!errors.nome}
              />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => handleDialogClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2Icon className="animate-spin" />}
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
