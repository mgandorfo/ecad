"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Atendimento, Role } from "@/lib/types";
import type { RelatorioFiltros } from "@/app/(app)/relatorios/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Download, Search, X, FileText, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 50;

interface SetorBasico { id: string; nome: string }
interface ServicoBasico { id: string; nome: string; setor_id: string }
interface StatusBasico { id: string; nome: string; cor: string; ordem: number }
interface ServidorBasico { id: string; nome: string }

interface RelatoriosClientProps {
  atendimentos: Atendimento[];
  totalRegistros: number;
  setores: SetorBasico[];
  servicos: ServicoBasico[];
  statusList: StatusBasico[];
  servidores: ServidorBasico[];
  role: Role;
  servidorAtualId: string;
  filtrosIniciais: RelatorioFiltros;
}

export function RelatoriosClient({
  atendimentos,
  totalRegistros,
  setores,
  servicos,
  statusList,
  servidores,
  role,
  servidorAtualId,
  filtrosIniciais,
}: RelatoriosClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [busca, setBusca] = useState(filtrosIniciais.busca);
  const [setorId, setSetorId] = useState(filtrosIniciais.setorId);
  const [servicoId, setServicoId] = useState(filtrosIniciais.servicoId);
  const [statusId, setStatusId] = useState(filtrosIniciais.statusId);
  const [servidorId, setServidorId] = useState(
    role === "entrevistador" ? servidorAtualId : filtrosIniciais.servidorId
  );
  const [prioridade, setPrioridade] = useState(filtrosIniciais.prioridade);
  const [dataInicio, setDataInicio] = useState(filtrosIniciais.dataInicio);
  const [dataFim, setDataFim] = useState(filtrosIniciais.dataFim);

  const podeVerServidor = role === "admin" || role === "vigilancia";
  const totalPages = Math.ceil(totalRegistros / PAGE_SIZE);
  const currentPage = filtrosIniciais.page;

  // Resolve nomes para exibição no trigger — evita mostrar UUID
  const setorNome = setores.find((s) => s.id === setorId)?.nome ?? "Todos os setores";
  const servicoNome = servicos.find((s) => s.id === servicoId)?.nome ?? "Todos os serviços";
  const statusNome = statusList.find((s) => s.id === statusId)?.nome ?? "Todos os status";
  const servidorNome = servidores.find((s) => s.id === servidorId)?.nome ?? "Todos os servidores";
  const prioridadeNome = prioridade === "sim" ? "Prioritário" : prioridade === "nao" ? "Normal" : "Todas";

  function buildParams(overrides: Record<string, string | number> = {}) {
    const base: Record<string, string> = {
      busca,
      setor: setorId,
      servico: servicoId,
      status: statusId,
      servidor: podeVerServidor ? servidorId : servidorAtualId,
      prioridade,
      de: dataInicio,
      ate: dataFim,
      page: String(currentPage),
    };
    const merged = { ...base, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])) };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "0") sp.set(k, v);
    }
    return sp.toString();
  }

  function aplicarFiltros() {
    startTransition(() => {
      router.push(`${pathname}?${buildParams({ page: 1 })}`);
    });
  }

  function limparFiltros() {
    setBusca("");
    setSetorId("");
    setServicoId("");
    setStatusId("");
    if (podeVerServidor) setServidorId("");
    setPrioridade("");
    setDataInicio("");
    setDataFim("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  function irParaPagina(page: number) {
    startTransition(() => {
      router.push(`${pathname}?${buildParams({ page })}`);
    });
  }

  const temFiltroAtivo =
    busca !== "" || dataInicio !== "" || dataFim !== "" ||
    setorId !== "" || servicoId !== "" || statusId !== "" ||
    prioridade !== "" || (podeVerServidor && servidorId !== "");

  function exportarCSV() {
    const cabecalho = [
      "Beneficiário", "CPF", "Setor", "Serviço", "Status",
      "Servidor", "Prioridade", "Data", "Concluído em",
    ];
    const linhas = atendimentos.map((a) => [
      a.beneficiario?.nome ?? "",
      a.beneficiario?.cpf ?? "",
      a.setor?.nome ?? "",
      a.servico?.nome ?? "",
      a.status?.nome ?? "",
      a.servidor?.nome ?? "—",
      a.prioritario ? "Sim" : "Não",
      format(new Date(a.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      a.concluido_em
        ? format(new Date(a.concluido_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
        : "—",
    ]);
    const csv = [cabecalho, ...linhas]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportarPDF() {
    const params = buildParams({ page: 1 });
    const res = await fetch(`/api/relatorios/pdf?${params}`);
    if (res.status === 413) {
      toast.error(await res.text());
      return;
    }
    if (!res.ok) {
      toast.error("Erro ao gerar PDF. Tente novamente.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar beneficiário ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
            className="pl-8 w-56"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-40" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-40" />
        </div>

        <Select value={setorId || null} onValueChange={(v) => setSetorId(v ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue>{setorNome}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos os setores</SelectItem>
            {setores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={servicoId || null} onValueChange={(v) => setServicoId(v ?? "")}>
          <SelectTrigger className="w-48">
            <SelectValue>{servicoNome}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos os serviços</SelectItem>
            {servicos.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusId || null} onValueChange={(v) => setStatusId(v ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue>{statusNome}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos os status</SelectItem>
            {statusList.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {podeVerServidor && (
          <Select value={servidorId || null} onValueChange={(v) => setServidorId(v ?? "")}>
            <SelectTrigger className="w-44">
              <SelectValue>{servidorNome}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todos os servidores</SelectItem>
              {servidores.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={prioridade || null} onValueChange={(v) => setPrioridade(v ?? "")}>
          <SelectTrigger className="w-36">
            <SelectValue>{prioridadeNome}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas</SelectItem>
            <SelectItem value="sim">Prioritário</SelectItem>
            <SelectItem value="nao">Normal</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={aplicarFiltros} disabled={isPending} size="sm">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Aplicar"}
        </Button>

        {temFiltroAtivo && (
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="gap-1.5">
            <X className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Contador + exportações */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalRegistros} {totalRegistros === 1 ? "registro" : "registros"} encontrado{totalRegistros === 1 ? "" : "s"}
          {totalPages > 1 && ` — página ${currentPage} de ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="gap-2"
            title={
              totalRegistros > PAGE_SIZE
                ? `Exporta apenas os ${atendimentos.length} registros desta página. Use o PDF para exportar tudo.`
                : undefined
            }
          >
            <Download className="size-4" />
            CSV
            {totalRegistros > PAGE_SIZE && <AlertCircle className="size-3.5 text-yellow-500" />}
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} className="gap-2">
            <FileText className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiário</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Servidor</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Concluído</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atendimentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  Nenhum atendimento encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              atendimentos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{a.beneficiario?.nome ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{a.beneficiario?.cpf ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm">{a.setor?.nome ?? "—"}</TableCell>
                  <TableCell className="text-sm">{a.servico?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {a.status ? (
                      <Badge variant="outline" style={{ borderColor: a.status.cor, color: a.status.cor }} className="text-xs">
                        {a.status.nome}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{a.servidor?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {a.prioritario
                      ? <Badge variant="destructive" className="text-xs">Prioritário</Badge>
                      : <span className="text-xs text-muted-foreground">Normal</span>}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(a.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {a.concluido_em
                      ? format(new Date(a.concluido_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => irParaPagina(currentPage - 1)} disabled={currentPage <= 1 || isPending}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => irParaPagina(currentPage + 1)} disabled={currentPage >= totalPages || isPending}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
