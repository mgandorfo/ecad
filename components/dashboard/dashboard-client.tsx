"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import type { DashboardData } from "@/app/(app)/dashboard/actions";
import type { Periodo } from "@/lib/dashboard-utils";
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

interface SetorBasico { id: string; nome: string }
interface ServidorBasico { id: string; nome: string }

interface DashboardClientProps {
  dashboardData: DashboardData;
  setores: SetorBasico[];
  servidores: ServidorBasico[];
  role: Role;
  servidorAtualId: string;
  periodo: Periodo;
  setorId: string;
  servidorId: string;
}

const PERIODOS: Record<string, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "mes": "Este mês",
};

export function DashboardClient({
  dashboardData,
  setores,
  servidores,
  role,
  periodo,
  setorId,
  servidorId,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  function push(params: Record<string, string>) {
    const sp = new URLSearchParams({ periodo, setor: setorId, servidor: servidorId, ...params });
    for (const [k, v] of Array.from(sp.entries())) {
      if (!v) sp.delete(k);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  const temFiltroAtivo = setorId !== "" || (role !== "entrevistador" && servidorId !== "");
  const podeVerServidor = role === "admin" || role === "vigilancia";

  const setorNome = setores.find((s) => s.id === setorId)?.nome ?? "Todos os setores";
  const servidorNome = servidores.find((s) => s.id === servidorId)?.nome ?? "Todos os servidores";

  const { kpis, porDia, porSetor, porServico, porStatus } = dashboardData;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Select value={periodo} onValueChange={(v) => { if (v) push({ periodo: v }); }}>
          <SelectTrigger className="w-40">
            <SelectValue>{PERIODOS[periodo] ?? periodo}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={setorId || null}
          onValueChange={(v) => push({ setor: v ?? "" })}
        >
          <SelectTrigger className="w-48">
            <SelectValue>{setorNome}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos os setores</SelectItem>
            {setores.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {podeVerServidor && (
          <Select
            value={servidorId || null}
            onValueChange={(v) => push({ servidor: v ?? "" })}
          >
            <SelectTrigger className="w-48">
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

        {temFiltroAtivo && (
          <Button variant="ghost" size="sm" onClick={() => push({ setor: "", servidor: "" })}>
            Limpar filtros
          </Button>
        )}
      </div>

      <KPICards
        total={kpis.total}
        emEspera={kpis.emEspera}
        concluidos={kpis.concluidos}
        tempoMedio={kpis.tempoMedio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPorDia data={porDia} />
        <ChartPorStatus data={porStatus} />
        <ChartPorSetor data={porSetor} />
        <ChartPorServico data={porServico} />
      </div>
    </div>
  );
}
