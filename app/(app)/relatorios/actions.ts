"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { Atendimento, Role } from "@/lib/types";

export type RelatorioFiltros = {
  busca: string;
  setorId: string;
  servicoId: string;
  statusId: string;
  servidorId: string;
  prioridade: string;
  dataInicio: string;
  dataFim: string;
  page: number;
};

export type RelatorioResult = {
  atendimentos: Atendimento[];
  total: number;
};

const PAGE_SIZE = 50;
const PDF_MAX_ROWS = 5000;

// Metacaracteres do PostgREST filter syntax que poderiam manipular a query no .or()
function sanitizarBusca(valor: string): string {
  return valor.replace(/[(),]/g, "");
}

type ViewRow = Record<string, unknown>;

function mapRow(r: ViewRow): Atendimento {
  return {
    id: r.id as string,
    beneficiario_id: r.beneficiario_id as string,
    setor_id: r.setor_id as string,
    servico_id: r.servico_id as string,
    status_id: r.status_id as string,
    servidor_id: r.servidor_id as string | null,
    criado_por: r.criado_por as string,
    prioritario: r.prioritario as boolean,
    anotacoes: r.anotacoes as string | null,
    criado_em: r.criado_em as string,
    atualizado_em: r.atualizado_em as string,
    assumido_em: r.assumido_em as string | null,
    concluido_em: r.concluido_em as string | null,
    beneficiario: r.beneficiario_nome
      ? {
          id: r.beneficiario_id as string,
          nome: r.beneficiario_nome as string,
          cpf: r.beneficiario_cpf as string,
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          uf: "",
          criado_em: "",
          atualizado_em: "",
        }
      : undefined,
    setor: r.setor_nome
      ? {
          id: r.setor_id as string,
          codigo: r.setor_codigo as string,
          nome: r.setor_nome as string,
          ativo: true,
        }
      : undefined,
    servico: r.servico_nome
      ? {
          id: r.servico_id as string,
          codigo: r.servico_codigo as string,
          nome: r.servico_nome as string,
          setor_id: r.setor_id as string,
          ativo: true,
        }
      : undefined,
    status: r.status_nome
      ? {
          id: r.status_id as string,
          nome: r.status_nome as string,
          cor: r.status_cor as string,
          ordem: r.status_ordem as number,
          ativo: true,
        }
      : undefined,
    servidor: r.servidor_nome
      ? {
          id: r.servidor_id as string,
          nome: r.servidor_nome as string,
          email: (r.servidor_email as string) || "",
          role: (r.servidor_role as Role) || "entrevistador",
          ativo: true,
          criado_em: "",
        }
      : undefined,
  };
}

function aplicarFiltros(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filtros: Omit<RelatorioFiltros, "page">,
  servidorId: string | null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (filtros.busca) {
    const buscaSanitizada = sanitizarBusca(filtros.busca);
    if (buscaSanitizada) {
      query = query.or(
        `beneficiario_nome.ilike.%${buscaSanitizada}%,beneficiario_cpf.ilike.%${buscaSanitizada}%`
      );
    }
  }
  if (filtros.setorId) query = query.eq("setor_id", filtros.setorId);
  if (filtros.servicoId) query = query.eq("servico_id", filtros.servicoId);
  if (filtros.statusId) query = query.eq("status_id", filtros.statusId);
  if (servidorId) query = query.eq("servidor_id", servidorId);
  if (filtros.prioridade === "sim") query = query.eq("prioritario", true);
  if (filtros.prioridade === "nao") query = query.eq("prioritario", false);
  if (filtros.dataInicio) query = query.gte("criado_em", filtros.dataInicio + "T00:00:00");
  if (filtros.dataFim) query = query.lte("criado_em", filtros.dataFim + "T23:59:59");
  return query;
}

export async function getRelatorios(filtros: RelatorioFiltros): Promise<RelatorioResult> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const servidorId =
    user?.role === "entrevistador" ? user.id : filtros.servidorId || null;

  let query = supabase.from("view_atendimentos").select("*", { count: "exact" });
  query = aplicarFiltros(query, filtros, servidorId);

  const from = (filtros.page - 1) * PAGE_SIZE;
  query = query.order("criado_em", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    atendimentos: (data ?? []).map(mapRow),
    total: count ?? 0,
  };
}

// Usada pelo PDF e CSV server-side — sem paginação, com limite de segurança
export async function getRelatoriosCompleto(
  filtros: Omit<RelatorioFiltros, "page">
): Promise<Atendimento[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const servidorId =
    user?.role === "entrevistador" ? user.id : filtros.servidorId || null;

  let query = supabase
    .from("view_atendimentos")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(PDF_MAX_ROWS);

  query = aplicarFiltros(query, filtros, servidorId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapRow);
}
