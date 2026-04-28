"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { Periodo } from "@/lib/dashboard-utils";

export type DashboardFiltros = {
  periodo: Periodo;
  setorId: string;
  servidorId: string;
};

export type KPIsData = {
  total: number;
  emEspera: number;
  concluidos: number;
  tempoMedio: number;
};

export type PorDiaItem = { dia: string; total: number };
export type PorSetorItem = { setor: string; total: number };
export type PorServicoItem = { servico: string; total: number };
export type PorStatusItem = { status: string; cor: string; total: number };

export type DashboardData = {
  kpis: KPIsData;
  porDia: PorDiaItem[];
  porSetor: PorSetorItem[];
  porServico: PorServicoItem[];
  porStatus: PorStatusItem[];
};

export async function getDashboardData(filtros: DashboardFiltros): Promise<DashboardData> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  // Entrevistador só vê os próprios dados
  const servidorId =
    user?.role === "entrevistador"
      ? user.id
      : filtros.servidorId || null;

  const setorId = filtros.setorId || null;

  const [kpisRes, porDiaRes, porSetorRes, porServicoRes, porStatusRes] = await Promise.all([
    supabase.rpc("kpis_dashboard", {
      p_periodo: filtros.periodo,
      p_setor_id: setorId,
      p_servidor_id: servidorId,
    }),
    supabase.rpc("atendimentos_por_dia", {
      p_periodo: filtros.periodo,
      p_setor_id: setorId,
      p_servidor_id: servidorId,
    }),
    supabase.rpc("atendimentos_por_setor", {
      p_periodo: filtros.periodo,
      p_servidor_id: servidorId,
    }),
    supabase.rpc("atendimentos_por_servico", {
      p_periodo: filtros.periodo,
      p_setor_id: setorId,
      p_servidor_id: servidorId,
    }),
    supabase.rpc("atendimentos_por_status", {
      p_periodo: filtros.periodo,
      p_setor_id: setorId,
      p_servidor_id: servidorId,
    }),
  ]);

  // CRITICAL: verificar erros de todas as RPCs — falha silenciosa retornaria zeros
  if (kpisRes.error) throw new Error(`kpis_dashboard: ${kpisRes.error.message}`);
  if (porDiaRes.error) throw new Error(`atendimentos_por_dia: ${porDiaRes.error.message}`);
  if (porSetorRes.error) throw new Error(`atendimentos_por_setor: ${porSetorRes.error.message}`);
  if (porServicoRes.error) throw new Error(`atendimentos_por_servico: ${porServicoRes.error.message}`);
  if (porStatusRes.error) throw new Error(`atendimentos_por_status: ${porStatusRes.error.message}`);

  const kpisRow = kpisRes.data?.[0];

  return {
    kpis: {
      total: Number(kpisRow?.total ?? 0),
      emEspera: Number(kpisRow?.em_espera ?? 0),
      concluidos: Number(kpisRow?.concluidos ?? 0),
      tempoMedio: Number(kpisRow?.tempo_medio_minutos ?? 0),
    },
    porDia: ((porDiaRes.data ?? []) as Array<{ dia: string; total: number }>).map((r) => ({
      dia: r.dia,
      total: Number(r.total),
    })),
    porSetor: ((porSetorRes.data ?? []) as Array<{ setor: string; total: number }>).map((r) => ({
      setor: r.setor,
      total: Number(r.total),
    })),
    porServico: ((porServicoRes.data ?? []) as Array<{ servico: string; total: number }>).map((r) => ({
      servico: r.servico,
      total: Number(r.total),
    })),
    porStatus: ((porStatusRes.data ?? []) as Array<{ status: string; cor: string; total: number }>).map((r) => ({
      status: r.status,
      cor: r.cor,
      total: Number(r.total),
    })),
  };
}
