"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { mockStatus } from "@/lib/mocks";
import type { StatusAtendimento } from "@/lib/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(60, "Máximo 60 caracteres"),
  cor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use formato #rrggbb"),
  ordem: z
    .string()
    .min(1, "Ordem obrigatória")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1,
      "Ordem deve ser um número maior que zero"
    ),
});
type FormData = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export function StatusClient() {
  const [items, setItems] = useState<StatusAtendimento[]>(mockStatus);
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StatusAtendimento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StatusAtendimento | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const corWatched = watch("cor") ?? "#6366f1";

  const filtered = useMemo(
    () =>
      items.filter((s) =>
        s.nome.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    reset({ nome: "", cor: "#6366f1", ordem: String(items.length + 1) });
    setDialogOpen(true);
  }

  function openEdit(item: StatusAtendimento) {
    setEditing(item);
    reset({ nome: item.nome, cor: item.cor, ordem: String(item.ordem) });
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open && !saving) {
      setDialogOpen(false);
      setEditing(null);
      reset({ nome: "", cor: "#6366f1", ordem: "" });
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const ordem = Number(data.ordem);
      if (editing) {
        setItems((prev) =>
          prev.map((s) =>
            s.id === editing.id
              ? { ...s, nome: data.nome, cor: data.cor, ordem }
              : s
          )
        );
        toast.success("Status atualizado com sucesso.");
      } else {
        const newItem: StatusAtendimento = {
          id: `st${Date.now()}`,
          nome: data.nome,
          cor: data.cor,
          ordem,
          ativo: true,
        };
        setItems((prev) =>
          [...prev, newItem].sort((a, b) => a.ordem - b.ordem)
        );
        toast.success("Status criado com sucesso.");
      }
      setDialogOpen(false);
      setEditing(null);
      reset({ nome: "", cor: "#6366f1", ordem: "" });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success("Status excluído.");
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Status"
        description="Configuração dos status de atendimento"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            Novo status
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome..."
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
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
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
                        ? "Nenhum status encontrado para a busca."
                        : "Nenhum status cadastrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {item.ordem}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.cor }}
                          />
                          {item.nome}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.cor}
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
              <span>{filtered.length} status</span>
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
              {editing ? "Editar status" : "Novo status"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="st-nome">Nome</Label>
              <Input
                id="st-nome"
                {...register("nome")}
                placeholder="Ex: Aguardando"
                aria-invalid={!!errors.nome}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="st-cor-hex">Cor</Label>
              <div className="flex items-center gap-2">
                {/* color picker sincroniza com o campo texto via watch+setValue */}
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(corWatched) ? corWatched : "#6366f1"}
                  onChange={(e) =>
                    setValue("cor", e.target.value, { shouldValidate: true })
                  }
                  className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
                  aria-label="Escolher cor"
                />
                <Input
                  id="st-cor-hex"
                  {...register("cor")}
                  placeholder="#6366f1"
                  className="font-mono"
                  aria-invalid={!!errors.cor}
                />
              </div>
              {errors.cor && (
                <p className="text-xs text-destructive">{errors.cor.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="st-ordem">Ordem de exibição</Label>
              <Input
                id="st-ordem"
                type="number"
                min={1}
                {...register("ordem")}
                placeholder="1"
                aria-invalid={!!errors.ordem}
              />
              {errors.ordem && (
                <p className="text-xs text-destructive">
                  {errors.ordem.message}
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
                {editing ? "Salvar alterações" : "Criar status"}
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
