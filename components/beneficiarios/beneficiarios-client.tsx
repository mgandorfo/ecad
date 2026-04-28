"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";

import type { Beneficiario } from "@/lib/types";
import { excluirBeneficiario } from "@/app/(app)/beneficiarios/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Props {
  initialItems: Beneficiario[];
  initialTotal: number;
}

export function BeneficiariosClient({ initialItems, initialTotal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiario | null>(null);

  const totalPages = Math.max(1, Math.ceil(initialTotal / PAGE_SIZE));

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      params.set("page", "1");
      router.replace(`/beneficiarios?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      params.set("page", String(newPage));
      router.replace(`/beneficiarios?${params.toString()}`);
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await excluirBeneficiario(deleteTarget.id);
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Beneficiário excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  function enderecoResumido(b: Beneficiario) {
    return [b.logradouro, b.numero, b.bairro].filter(Boolean).join(", ");
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
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

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
            {initialItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
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
              initialItems.map((b) => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/beneficiarios/${b.id}`)}
                >
                  <TableCell className="font-medium">{b.nome}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCpf(b.cpf)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{enderecoResumido(b)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b.cidade} / {b.uf}</TableCell>
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
          <span>{initialTotal} beneficiário{initialTotal !== 1 ? "s" : ""}</span>
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

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nome}
      />
    </div>
  );
}
