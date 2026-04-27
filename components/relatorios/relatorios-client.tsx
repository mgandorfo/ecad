"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Atendimento, Setor, Servico, StatusAtendimento, Perfil, Role } from "@/lib/types";
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
import { Download, Search, X } from "lucide-react";

interface RelatoriosClientProps {
  atendimentos: Atendimento[];
  setores: Setor[];
  servicos: Servico[];
  statusList: StatusAtendimento[];
  servidores: Perfil[];
  role: Role;
  servidorAtualId: string;
}

export function RelatoriosClient({
  atendimentos,
  setores,
  servicos,
  statusList,
  servidores,
  role,
  servidorAtualId,
}: RelatoriosClientProps) {
  const [busca, setBusca] = useState("");
  const [setorId, setSetorId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [servidorId, setServidorId] = useState(
    role === "entrevistador" ? servidorAtualId : ""
  );
  const [prioridade, setPrioridade] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const podeVerServidor = role === "admin" || role === "vigilancia";

  const temFiltroAtivo =
    busca !== "" ||
    dataInicio !== "" ||
    dataFim !== "" ||
    setorId !== "" ||
    servicoId !== "" ||
    statusId !== "" ||
    prioridade !== "" ||
    (role !== "entrevistador" && servidorId !== "");

  function limparFiltros() {
    setBusca("");
    setDataInicio("");
    setDataFim("");
    setSetorId("");
    setServicoId("");
    setStatusId("");
    setPrioridade("");
    if (role !== "entrevistador") setServidorId("");
  }

  const filtrados = useMemo(() => {
    return atendimentos.filter((a) => {
      if (busca) {
        const termo = busca.toLowerCase();
        const nomeOk = a.beneficiario?.nome.toLowerCase().includes(termo);
        const cpfOk = a.beneficiario?.cpf.includes(termo);
        if (!nomeOk && !cpfOk) return false;
      }
      if (setorId && a.setor_id !== setorId) return false;
      if (servicoId && a.servico_id !== servicoId) return false;
      if (statusId && a.status_id !== statusId) return false;
      if (servidorId && a.servidor_id !== servidorId) return false;
      if (prioridade === "sim" && !a.prioritario) return false;
      if (prioridade === "nao" && a.prioritario) return false;
      if (dataInicio) {
        const inicio = new Date(dataInicio + "T00:00:00");
        if (new Date(a.criado_em) < inicio) return false;
      }
      if (dataFim) {
        const fim = new Date(dataFim + "T23:59:59");
        if (new Date(a.criado_em) > fim) return false;
      }
      return true;
    });
  }, [atendimentos, busca, setorId, servicoId, statusId, servidorId, prioridade, dataInicio, dataFim]);

  function exportarCSV() {
    const cabecalho = [
      "ID",
      "Beneficiário",
      "CPF",
      "Setor",
      "Serviço",
      "Status",
      "Servidor",
      "Prioridade",
      "Data",
      "Concluído em",
    ];

    const linhas = filtrados.map((a) => [
      a.id,
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
    link.download = `relatorio-atendimentos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar beneficiário ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8 w-56"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40"
          />
        </div>

        <Select value={setorId} onValueChange={(v) => { if (v !== null) setSetorId(v); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os setores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os setores</SelectItem>
            {setores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={servicoId} onValueChange={(v) => { if (v !== null) setServicoId(v); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os serviços" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os serviços</SelectItem>
            {servicos.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusId} onValueChange={(v) => { if (v !== null) setStatusId(v); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {statusList.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {podeVerServidor && (
          <Select value={servidorId} onValueChange={(v) => { if (v !== null) setServidorId(v); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todos os servidores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os servidores</SelectItem>
              {servidores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={prioridade} onValueChange={(v) => { if (v !== null) setPrioridade(v); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="sim">Prioritário</SelectItem>
            <SelectItem value="nao">Normal</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          {temFiltroAtivo && (
            <Button variant="ghost" size="sm" onClick={limparFiltros} className="gap-1.5">
              <X className="size-3.5" />
              Limpar filtros
            </Button>
          )}
          <Button variant="outline" onClick={exportarCSV} className="gap-2">
            <Download className="size-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        {filtrados.length} {filtrados.length === 1 ? "registro" : "registros"} encontrado{filtrados.length === 1 ? "" : "s"}
      </p>

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
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  Nenhum atendimento encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{a.beneficiario?.nome ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{a.beneficiario?.cpf ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm">{a.setor?.nome ?? "—"}</TableCell>
                  <TableCell className="text-sm">{a.servico?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {a.status ? (
                      <Badge
                        variant="outline"
                        style={{ borderColor: a.status.cor, color: a.status.cor }}
                        className="text-xs"
                      >
                        {a.status.nome}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{a.servidor?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {a.prioritario ? (
                      <Badge variant="destructive" className="text-xs">Prioritário</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Normal</span>
                    )}
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
    </div>
  );
}
