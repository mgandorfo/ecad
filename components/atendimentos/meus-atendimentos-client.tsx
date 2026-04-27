"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListChecksIcon, FilterIcon } from "lucide-react";

import { atendimentosStore } from "@/lib/stores/atendimentos";
import { mockStatus } from "@/lib/mocks/status";
import type { Atendimento } from "@/lib/types";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/atendimentos/status-badge";
import { PrioridadeBadge } from "@/components/atendimentos/prioridade-badge";
import { TempoEspera } from "@/components/atendimentos/tempo-espera";
import { formatDateTime } from "@/lib/format";

const SERVIDOR_MOCK_ID = "u2";

export function MeusAtendimentosClient() {
  const router = useRouter();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(() =>
    atendimentosStore.getAll()
  );
  const [filterStatus, setFilterStatus] = useState("todos");

  useEffect(() => {
    return atendimentosStore.subscribe(() => {
      setAtendimentos(atendimentosStore.getAll());
    });
  }, []);

  const meus = useMemo(() => {
    return atendimentos
      .filter((a) => {
        if (a.servidor_id !== SERVIDOR_MOCK_ID) return false;
        if (filterStatus !== "todos" && a.status_id !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime());
  }, [atendimentos, filterStatus]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meus Atendimentos"
        description="Atendimentos sob sua responsabilidade"
        actions={
          <Button onClick={() => router.push("/atendimentos/novo")}>
            <ListChecksIcon />
            Novo atendimento
          </Button>
        }
      />

      {/* Filtro por status */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterIcon className="size-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={(v) => { if (v !== null) setFilterStatus(v); }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {mockStatus.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filterStatus !== "todos" && (
          <Button variant="ghost" size="sm" onClick={() => setFilterStatus("todos")}>
            Limpar filtro
          </Button>
        )}

        <Badge variant="secondary" className="ml-auto">
          {meus.length} atendimento{meus.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {meus.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <ListChecksIcon className="size-10 opacity-30" />
          <p className="text-sm">Nenhum atendimento encontrado.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beneficiário</TableHead>
                <TableHead>Setor / Serviço</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Espera / Tempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meus.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/atendimentos/${a.id}`)}
                >
                  <TableCell>
                    <p className="font-medium">{a.beneficiario?.nome ?? "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {a.beneficiario?.cpf}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{a.setor?.codigo}</p>
                    <p className="text-xs text-muted-foreground">{a.servico?.nome}</p>
                  </TableCell>
                  <TableCell>
                    <PrioridadeBadge prioritario={a.prioritario} showNormal />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(a.atualizado_em)}
                  </TableCell>
                  <TableCell>
                    {a.concluido_em ? (
                      <span className="text-xs text-muted-foreground">
                        Concluído {formatDateTime(a.concluido_em)}
                      </span>
                    ) : (
                      <TempoEspera desde={a.criado_em} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
