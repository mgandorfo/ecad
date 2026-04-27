"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardListIcon,
  UserCheckIcon,
  FilterIcon,
  ListChecksIcon,
  PlusIcon,
} from "lucide-react";

import { atendimentosStore } from "@/lib/stores/atendimentos";
import { mockStatus } from "@/lib/mocks/status";
import { mockSetores } from "@/lib/mocks/setores";
import { mockServicos } from "@/lib/mocks/servicos";
import { mockUsuarios } from "@/lib/mocks/usuarios";
import type { Atendimento } from "@/lib/types";
import { useRole } from "@/lib/role-context";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/atendimentos/status-badge";
import { PrioridadeBadge } from "@/components/atendimentos/prioridade-badge";
import { TempoEspera } from "@/components/atendimentos/tempo-espera";
import { NovoAtendimentoSheet } from "@/components/atendimentos/novo-atendimento-sheet";
import { formatDateTime } from "@/lib/format";

const SERVIDOR_MOCK_ID = "u2";
const STATUS_EM_ATENDIMENTO = mockStatus.find((s) => s.nome === "Em Atendimento") ?? mockStatus[1];
const STATUS_AGUARDANDO_ID = mockStatus.find((s) => s.ordem === 1)?.id ?? "st1";

export function AtendimentosPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useRole();

  const tabParam = searchParams.get("aba");
  const defaultTab = tabParam === "meus" ? "meus" : "fila";

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>(() => atendimentosStore.getAll());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [assumirTarget, setAssumirTarget] = useState<Atendimento | null>(null);

  // Filtros fila
  const [filterSetor, setFilterSetor] = useState("todos");
  const [filterServico, setFilterServico] = useState("todos");

  // Filtro meus atendimentos
  const [filterStatus, setFilterStatus] = useState("todos");

  useEffect(() => {
    return atendimentosStore.subscribe(() => {
      setAtendimentos(atendimentosStore.getAll());
    });
  }, []);

  const setoresAtivos = mockSetores.filter((s) => s.ativo);
  const servicosFiltradosFila = useMemo(
    () =>
      filterSetor === "todos"
        ? mockServicos.filter((s) => s.ativo)
        : mockServicos.filter((s) => s.setor_id === filterSetor && s.ativo),
    [filterSetor]
  );

  const fila = useMemo(() => {
    return atendimentos
      .filter((a) => {
        if (a.status_id !== STATUS_AGUARDANDO_ID) return false;
        if (filterSetor !== "todos" && a.setor_id !== filterSetor) return false;
        if (filterServico !== "todos" && a.servico_id !== filterServico) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.prioritario !== b.prioritario) return a.prioritario ? -1 : 1;
        return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
      });
  }, [atendimentos, filterSetor, filterServico]);

  const meus = useMemo(() => {
    return atendimentos
      .filter((a) => {
        if (a.servidor_id !== SERVIDOR_MOCK_ID) return false;
        if (filterStatus !== "todos" && a.status_id !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime());
  }, [atendimentos, filterStatus]);

  function handleAssumirConfirm() {
    if (!assumirTarget) return;
    const target = assumirTarget;
    const servidor = mockUsuarios.find((u) => u.id === SERVIDOR_MOCK_ID);
    atendimentosStore.assumir(target.id, SERVIDOR_MOCK_ID, servidor, STATUS_EM_ATENDIMENTO);
    toast.success(`Atendimento de ${target.beneficiario?.nome} assumido.`);
    setAssumirTarget(null);
    router.push(`/atendimentos/${target.id}`);
  }

  const canAssume = role === "admin" || role === "entrevistador";
  const canCreate = role === "admin" || role === "entrevistador" || role === "recepcionista";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Atendimentos"
        description="Gerencie a fila e seus atendimentos em andamento"
        actions={
          canCreate ? (
            <Button onClick={() => setSheetOpen(true)}>
              <PlusIcon />
              Nova chegada
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="fila">
            <ClipboardListIcon className="size-4" />
            Fila de Espera
            {fila.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {fila.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="meus">
            <ListChecksIcon className="size-4" />
            Meus Atendimentos
            {meus.filter((a) => !a.concluido_em).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {meus.filter((a) => !a.concluido_em).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Fila ── */}
        <TabsContent value="fila" className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterIcon className="size-4 text-muted-foreground" />
            <Select
              value={filterSetor}
              onValueChange={(v) => {
                if (v !== null) { setFilterSetor(v); setFilterServico("todos"); }
              }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setoresAtivos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterServico}
              onValueChange={(v) => { if (v !== null) setFilterServico(v); }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os serviços</SelectItem>
                {servicosFiltradosFila.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterSetor !== "todos" || filterServico !== "todos") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilterSetor("todos"); setFilterServico("todos"); }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Beneficiário</TableHead>
                  <TableHead>Setor / Serviço</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Espera</TableHead>
                  {canAssume && <TableHead className="w-36" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fila.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canAssume ? 8 : 7}
                      className="py-14 text-center text-muted-foreground"
                    >
                      <ClipboardListIcon className="mx-auto mb-2 size-8 opacity-30" />
                      Nenhum atendimento aguardando.
                    </TableCell>
                  </TableRow>
                ) : (
                  fila.map((a, index) => (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/atendimentos/${a.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
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
                        {formatDateTime(a.criado_em)}
                      </TableCell>
                      <TableCell>
                        <TempoEspera desde={a.criado_em} />
                      </TableCell>
                      {canAssume && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => setAssumirTarget(a)}
                          >
                            <UserCheckIcon className="size-3.5" />
                            Assumir
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Tab: Meus Atendimentos ── */}
        <TabsContent value="meus" className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterIcon className="size-4 text-muted-foreground" />
            <Select
              value={filterStatus}
              onValueChange={(v) => { if (v !== null) setFilterStatus(v); }}
            >
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
        </TabsContent>
      </Tabs>

      {/* Sheet de novo atendimento */}
      <NovoAtendimentoSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      {/* Dialog de confirmar assumir */}
      <AlertDialog open={!!assumirTarget} onOpenChange={(o) => { if (!o) setAssumirTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assumir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você vai assumir o atendimento de{" "}
              <strong>{assumirTarget?.beneficiario?.nome}</strong>. O status será
              alterado para <em>Em Atendimento</em> e você será o responsável.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssumirConfirm}>Assumir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
