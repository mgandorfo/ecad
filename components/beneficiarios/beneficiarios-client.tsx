"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";

import { mockBeneficiarios } from "@/lib/mocks";
import type { Beneficiario } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { formatCpf } from "@/lib/utils/cpf";

const PAGE_SIZE = 10;

export function BeneficiariosClient() {
  const router = useRouter();
  const [items, setItems] = useState<Beneficiario[]>(mockBeneficiarios);
  const [loading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiario | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\D/g, "");
    return items.filter((b) => {
      const matchNome = b.nome.toLowerCase().includes(search.toLowerCase());
      const matchCpf = b.cpf.replace(/\D/g, "").includes(q);
      return matchNome || (q.length > 0 && matchCpf);
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    toast.success("Beneficiário excluído.");
    setDeleteTarget(null);
  }

  function enderecoResumido(b: Beneficiario) {
    const parts = [b.logradouro, b.numero, b.bairro].filter(Boolean);
    return parts.join(", ");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Beneficiários"
        description="Cadastro e busca de beneficiários"
        actions={
          <Button onClick={() => router.push("/beneficiarios/novo")}>
            <PlusIcon />
            Novo beneficiário
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou CPF..."
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
                  <TableHead>CPF</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade / UF</TableHead>
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
                      {search ? (
                        "Nenhum beneficiário encontrado para a busca."
                      ) : (
                        <span className="flex flex-col items-center gap-2">
                          <UserIcon className="size-8 opacity-30" />
                          Nenhum beneficiário cadastrado.
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((b) => (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/beneficiarios/${b.id}`)}
                    >
                      <TableCell className="font-medium">{b.nome}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatCpf(b.cpf)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {enderecoResumido(b)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {b.cidade} / {b.uf}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <RowActions
                          onEdit={() => router.push(`/beneficiarios/${b.id}`)}
                          onDelete={() => setDeleteTarget(b)}
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
                {filtered.length} beneficiário
                {filtered.length !== 1 ? "s" : ""}
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
