import type { Atendimento } from "@/lib/types";
import { format, subDays, startOfDay, endOfDay, startOfMonth, eachDayOfInterval, isWithinInterval, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export type Periodo = "7d" | "30d" | "mes";

export function filtrarPorPeriodo(atendimentos: Atendimento[], periodo: Periodo): Atendimento[] {
  const hoje = new Date();
  const inicio = periodo === "7d"
    ? subDays(startOfDay(hoje), 6)
    : periodo === "30d"
    ? subDays(startOfDay(hoje), 29)
    : new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return atendimentos.filter((a) => {
    const criado = new Date(a.criado_em);
    return isWithinInterval(criado, { start: inicio, end: endOfDay(hoje) });
  });
}

export function filtrarPorSetor(atendimentos: Atendimento[], setorId: string): Atendimento[] {
  if (!setorId) return atendimentos;
  return atendimentos.filter((a) => a.setor_id === setorId);
}

export function filtrarPorServidor(atendimentos: Atendimento[], servidorId: string): Atendimento[] {
  if (!servidorId) return atendimentos;
  return atendimentos.filter((a) => a.servidor_id === servidorId);
}

// Recebe a lista já filtrada pelo período/setor/servidor escolhido pelo usuário
export function calcularKPIs(atendimentos: Atendimento[]) {
  const total = atendimentos.length;
  const emEspera = atendimentos.filter((a) => a.status?.nome === "Aguardando").length;
  const concluidos = atendimentos.filter((a) => !!a.concluido_em);

  const temposMins = concluidos
    .map((a) => {
      if (!a.concluido_em) return null;
      return differenceInMinutes(new Date(a.concluido_em), new Date(a.criado_em));
    })
    .filter((t): t is number => t !== null && t >= 0);

  const tempoMedio =
    temposMins.length > 0
      ? Math.round(temposMins.reduce((a, b) => a + b, 0) / temposMins.length)
      : 0;

  return {
    total,
    emEspera,
    concluidos: concluidos.length,
    tempoMedio,
  };
}

export function agruparPorDia(atendimentos: Atendimento[], periodo: Periodo) {
  const hoje = new Date();

  const diasDoIntervalo =
    periodo === "7d"
      ? Array.from({ length: 7 }, (_, i) => subDays(hoje, 6 - i))
      : periodo === "30d"
      ? Array.from({ length: 30 }, (_, i) => subDays(hoje, 29 - i))
      : eachDayOfInterval({ start: startOfMonth(hoje), end: hoje });

  const labelFmt = periodo === "7d" ? "EEE" : "dd/MM";

  return diasDoIntervalo.map((dia) => {
    const inicio = startOfDay(dia);
    const fim = endOfDay(dia);
    const count = atendimentos.filter((a) =>
      isWithinInterval(new Date(a.criado_em), { start: inicio, end: fim })
    ).length;
    return {
      dia: format(dia, labelFmt, { locale: ptBR }),
      total: count,
    };
  });
}

export function agruparPorSetor(atendimentos: Atendimento[]) {
  const map = new Map<string, number>();
  for (const a of atendimentos) {
    const nome = a.setor?.nome ?? a.setor_id;
    map.set(nome, (map.get(nome) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([setor, total]) => ({ setor, total }))
    .sort((a, b) => b.total - a.total);
}

export function agruparPorServico(atendimentos: Atendimento[]) {
  const map = new Map<string, number>();
  for (const a of atendimentos) {
    const nome = a.servico?.nome ?? a.servico_id;
    map.set(nome, (map.get(nome) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([servico, total]) => ({ servico, total }))
    .sort((a, b) => b.total - a.total);
}

export function agruparPorStatus(atendimentos: Atendimento[]) {
  const map = new Map<string, { total: number; cor: string }>();
  for (const a of atendimentos) {
    const nome = a.status?.nome ?? a.status_id;
    const cor = a.status?.cor ?? "#94a3b8";
    const atual = map.get(nome) ?? { total: 0, cor };
    map.set(nome, { total: atual.total + 1, cor });
  }
  return Array.from(map.entries()).map(([status, { total, cor }]) => ({
    status,
    total,
    cor,
  }));
}
