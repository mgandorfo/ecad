"use client";

import { useState, useMemo } from "react";
import type { Atendimento, Setor, Perfil, Role } from "@/lib/types";
import {
  filtrarPorPeriodo,
  filtrarPorSetor,
  filtrarPorServidor,
  calcularKPIs,
  agruparPorDia,
  agruparPorSetor,
  agruparPorServico,
  agruparPorStatus,
  type Periodo,
} from "@/lib/dashboard-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KPICards } from "./kpi-cards";
import { ChartPorDia } from "./chart-por-dia";
import { ChartPorSetor } from "./chart-por-setor";
import { ChartPorServico } from "./chart-por-servico";
import { ChartPorStatus } from "./chart-por-status";

interface DashboardClientProps {
  atendimentos: Atendimento[];
  setores: Setor[];
  servidores: Perfil[];
  role: Role;
  servidorAtualId: string;
}

export function DashboardClient({
  atendimentos,
  setores,
  servidores,
  role,
  servidorAtualId,
}: DashboardClientProps) {
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [setorId, setSetorId] = useState("");
  const [servidorId, setServidorId] = useState(
    role === "entrevistador" ? servidorAtualId : ""
  );

  const temFiltroAtivo = setorId !== "" || (role !== "entrevistador" && servidorId !== "");

  function limparFiltros() {
    setSetorId("");
    if (role !== "entrevistador") setServidorId("");
  }

  const filtrados = useMemo(() => {
    let lista = filtrarPorPeriodo(atendimentos, periodo);
    lista = filtrarPorSetor(lista, setorId);
    lista = filtrarPorServidor(lista, servidorId);
    return lista;
  }, [atendimentos, periodo, setorId, servidorId]);

  const kpis = useMemo(() => calcularKPIs(filtrados), [filtrados]);
  const porDia = useMemo(() => agruparPorDia(filtrados, periodo), [filtrados, periodo]);
  const porSetor = useMemo(() => agruparPorSetor(filtrados), [filtrados]);
  const porServico = useMemo(() => agruparPorServico(filtrados), [filtrados]);
  const porStatus = useMemo(() => agruparPorStatus(filtrados), [filtrados]);

  const podeVerServidor = role === "admin" || role === "vigilancia";

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={periodo} onValueChange={(v) => { if (v !== null) setPeriodo(v as Periodo); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
          </SelectContent>
        </Select>

        <Select value={setorId} onValueChange={(v) => { if (v !== null) setSetorId(v); }}>
          <SelectTrigger className="w-48">
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

        {podeVerServidor && (
          <Select value={servidorId} onValueChange={(v) => { if (v !== null) setServidorId(v); }}>
            <SelectTrigger className="w-48">
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

        {temFiltroAtivo && (
          <Button variant="ghost" size="sm" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        )}
      </div>

      <KPICards {...kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPorDia data={porDia} />
        <ChartPorStatus data={porStatus} />
        <ChartPorSetor data={porSetor} />
        <ChartPorServico data={porServico} />
      </div>
    </div>
  );
}
