"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { mockServicos, mockSetores } from "@/lib/mocks";
import type { Servico } from "@/lib/types";
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

const schema = z.object({
  codigo: z
    .string()
    .min(1, "Código obrigatório")
    .max(15, "Máximo 15 caracteres"),
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  setor_id: z.string().min(1, "Setor obrigatório"),
});
type FormData = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export function ServicosClient() {
  const [items, setItems] = useState<Servico[]>(mockServicos);
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Servico | null>(null);
  const [setorId, setSetorId] = useState("");

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
    setSetorId("");
    reset({ codigo: "", nome: "", setor_id: "" });
    setDialogOpen(true);
  }

  function openEdit(item: Servico) {
    setEditing(item);
    setSetorId(item.setor_id);
    reset({ codigo: item.codigo, nome: item.nome, setor_id: item.setor_id });
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open && !saving) {
      setDialogOpen(false);
      setEditing(null);
      setSetorId("");
      reset({ codigo: "", nome: "", setor_id: "" });
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      if (editing) {
        setItems((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
        );
        toast.success("Serviço atualizado com sucesso.");
      } else {
        const newItem: Servico = {
          id: `sv${Date.now()}`,
          codigo: data.codigo,
          nome: data.nome,
          setor_id: data.setor_id,
          ativo: true,
        };
        setItems((prev) => [newItem, ...prev]);
        toast.success("Serviço criado com sucesso.");
      }
      setDialogOpen(false);
      setEditing(null);
      setSetorId("");
      reset({ codigo: "", nome: "", setor_id: "" });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success("Serviço excluído.");
    setDeleteTarget(null);
  }

  function getSetorNome(setor_id: string) {
    return mockSetores.find((s) => s.id === setor_id)?.nome ?? "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Serviços"
        description="Gerenciamento de serviços oferecidos"
        actions={
          <Button onClick={openCreate}>
            <PlusIcon />
            Novo serviço
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por código ou nome..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Setor</TableHead>
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
                        ? "Nenhum serviço encontrado para a busca."
                        : "Nenhum serviço cadastrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">
                        {item.codigo}
                      </TableCell>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getSetorNome(item.setor_id)}
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
                {filtered.length} serviço{filtered.length !== 1 ? "s" : ""}
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
              {editing ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-codigo">Código</Label>
              <Input
                id="s-codigo"
                {...register("codigo")}
                placeholder="Ex: CAD-INC"
                aria-invalid={!!errors.codigo}
              />
              {errors.codigo && (
                <p className="text-xs text-destructive">
                  {errors.codigo.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-nome">Nome</Label>
              <Input
                id="s-nome"
                {...register("nome")}
                placeholder="Ex: Inclusão no CadÚnico"
                aria-invalid={!!errors.nome}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Setor</Label>
              <div className="w-full">
                <Select
                  value={setorId}
                  onValueChange={(v) => {
                    if (!v) return;
                    setSetorId(v);
                    setValue("setor_id", v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.setor_id}>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSetores
                      .filter((s) => s.ativo)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.setor_id && (
                <p className="text-xs text-destructive">
                  {errors.setor_id.message}
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
                {editing ? "Salvar alterações" : "Criar serviço"}
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
