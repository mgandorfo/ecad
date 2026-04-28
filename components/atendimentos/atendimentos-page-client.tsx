"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardListIcon,
  UserCheckIcon,
  FilterIcon,
  ListChecksIcon,
  PlusIcon,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

import { assumirAtendimento } from "@/app/(app)/atendimentos/actions";
import type { AtendimentoComJoins } from "@/app/(app)/atendimentos/actions";
import type { Setor, Servico, StatusAtendimento } from "@/lib/types";
import { useRole } from "@/lib/role-context";
import { useFilaRealtime } from "@/lib/hooks/use-fila-realtime";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AtendimentosPageClientProps {
  fila: AtendimentoComJoins[];
  meus: AtendimentoComJoins[];
  setores: Setor[];
  servicos: Servico[];
  allStatus: StatusAtendimento[];
  filterSetorId?: string;
  filterServicoId?: string;
  filterStatusId?: string;
}

export function AtendimentosPageClient({
  fila,
  meus,
  setores,
  servicos,
  allStatus,
  filterSetorId,
  filterServicoId,
  filterStatusId,
}: AtendimentosPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useRole();

  const tabParam = searchParams.get("aba");
  const defaultTab = tabParam === "meus" ? "meus" : "fila";

  const [sheetOpen, setSheetOpen] = useState(false);
  const [assumirTarget, setAssumirTarget] = useState<AtendimentoComJoins | null>(null);
  const [isPending, startTransition] = useTransition();

  // Realtime: re-fetcha os dados quando a fila muda
  useFilaRealtime();

  const setoresAtivos = setores.filter((s) => s.ativo);
  const meusEmAndamento = meus.filter((a) => !a.concluido_em);
  const servicosFiltraveisNaFila =
    filterSetorId && filterSetorId !== "todos"
      ? servicos.filter((s) => s.setor_id === filterSetorId && s.ativo)
      : servicos.filter((s) => s.ativo);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todos") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reseta serviço ao trocar setor
    if (key === "setor") params.delete("servico");
    router.push(`/atendimentos?${params.toString()}`);
  }

  function handleAssumirConfirm() {
    if (!assumirTarget) return;
    const target = assumirTarget;
    setAssumirTarget(null);

    startTransition(async () => {
      const result = await assumirAtendimento(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Atendimento de ${target.beneficiario.nome} assumido.`);
      router.push(`/atendimentos/${target.id}`);
    });
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
              <PlusIcon aria-hidden="true" />
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
            {meusEmAndamento.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {meusEmAndamento.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Fila ── */}
        <TabsContent value="fila" className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterIcon className="size-4 text-muted-foreground" />
            <Select
              value={filterSetorId ?? "todos"}
              onValueChange={(v) => { if (v !== null) updateFilter("setor", v); }}
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
              value={filterServicoId ?? "todos"}
              onValueChange={(v) => { if (v !== null) updateFilter("servico", v); }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os serviços</SelectItem>
                {servicosFiltraveisNaFila.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterSetorId || filterServicoId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/atendimentos")}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="rounded-lg border overflow-x-auto">
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
                    <TableCell colSpan={canAssume ? 8 : 7} className="p-0">
                      <EmptyState
                        icon={<ClipboardListIcon className="size-5" />}
                        title="Fila vazia"
                        description="Nenhum atendimento aguardando no momento."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  fila.map((a, index) => (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer"
                      tabIndex={0}
                      onClick={() => router.push(`/atendimentos/${a.id}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/atendimentos/${a.id}`); } }}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{a.beneficiario.nome}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {a.beneficiario.cpf}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{a.setor.codigo}</p>
                        <p className="text-xs text-muted-foreground">{a.servico.nome}</p>
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
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5"
                                  disabled={isPending}
                                  onClick={() => setAssumirTarget(a)}
                                />
                              }
                            >
                              <UserCheckIcon className="size-3.5" aria-hidden="true" />
                              Assumir
                            </TooltipTrigger>
                            <TooltipContent>Assumir este atendimento e tornar-se responsável</TooltipContent>
                          </Tooltip>
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
              value={filterStatusId ?? "todos"}
              onValueChange={(v) => { if (v !== null) updateFilter("status", v); }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {allStatus.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterStatusId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  router.push(`/atendimentos?${params.toString()}`);
                }}
              >
                Limpar filtro
              </Button>
            )}
          </div>

          {meus.length === 0 ? (
            <EmptyState
              icon={<ListChecksIcon className="size-5" />}
              title="Nenhum atendimento"
              description={
                filterStatusId
                  ? "Nenhum atendimento com o status selecionado."
                  : "Você ainda não assumiu nenhum atendimento."
              }
            />
          ) : (
            <div className="rounded-lg border overflow-x-auto">
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
                      tabIndex={0}
                      onClick={() => router.push(`/atendimentos/${a.id}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/atendimentos/${a.id}`); } }}
                    >
                      <TableCell>
                        <p className="font-medium">{a.beneficiario.nome}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {a.beneficiario.cpf}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{a.setor.codigo}</p>
                        <p className="text-xs text-muted-foreground">{a.servico.nome}</p>
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

      <NovoAtendimentoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        setores={setores}
        servicos={servicos}
      />

      <AlertDialog open={!!assumirTarget} onOpenChange={(o) => { if (!o) setAssumirTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assumir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você vai assumir o atendimento de{" "}
              <strong>{assumirTarget?.beneficiario.nome}</strong>. O status será
              alterado para <em>Em Atendimento</em> e você será o responsável.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssumirConfirm} disabled={isPending}>
              Assumir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
