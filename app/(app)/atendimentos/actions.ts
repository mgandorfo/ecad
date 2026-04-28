"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getRequiredUser } from "@/lib/supabase/auth";
import { registrarAuditoria } from "@/lib/supabase/audit";
import type { Atendimento, Perfil, Setor, Servico, StatusAtendimento } from "@/lib/types";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ── Tipos ──────────────────────────────────────────────────────────────────

export type AtendimentoComJoins = Atendimento & {
  beneficiario: NonNullable<Atendimento["beneficiario"]>;
  setor: Setor;
  servico: Servico;
  status: StatusAtendimento;
  servidor: Perfil | null;
};

const SELECT_JOINS = `
  *,
  beneficiario:beneficiarios(*),
  setor:setores(*),
  servico:servicos(*),
  status:status_atendimento(*),
  servidor:perfis!atendimentos_servidor_id_fkey(*)
`.trim();

// z.string().uuid() do Zod v4 rejeita UUIDs sequenciais (ex: 00000000-0000-0000-0000-000000000001)
// usados como seed no banco. Validamos apenas que é string não-vazia; a FK do Postgres garante integridade.
const uuidSchema = z.string().min(1);

// ── Queries ────────────────────────────────────────────────────────────────

export async function getFilaAtendimentos(filtros?: {
  setor_id?: string;
  servico_id?: string;
}): Promise<AtendimentoComJoins[]> {
  const supabase = await createClient();
  await getRequiredUser(); // CRITICAL: garante sessão autenticada além do RLS

  const { data: statusAguardando } = await supabase
    .from("status_atendimento")
    .select("id")
    .order("ordem", { ascending: true })
    .limit(1)
    .single();

  if (!statusAguardando) return [];

  let query = supabase
    .from("atendimentos")
    .select(SELECT_JOINS)
    .eq("status_id", statusAguardando.id)
    .is("concluido_em", null)
    .order("prioritario", { ascending: false })
    .order("criado_em", { ascending: true });

  if (filtros?.setor_id) query = query.eq("setor_id", filtros.setor_id);
  if (filtros?.servico_id) query = query.eq("servico_id", filtros.servico_id);

  const { data, error } = await query;
  if (error) {
    console.error("[getFilaAtendimentos]", error.message);
    throw new Error("Falha ao carregar fila de atendimentos.");
  }
  return (data ?? []) as unknown as AtendimentoComJoins[];
}

export async function getMeusAtendimentos(filtros?: {
  status_id?: string;
}): Promise<AtendimentoComJoins[]> {
  const supabase = await createClient();
  const user = await getRequiredUser();

  let query = supabase
    .from("atendimentos")
    .select(SELECT_JOINS)
    .eq("servidor_id", user.id)
    .order("atualizado_em", { ascending: false });

  if (filtros?.status_id) query = query.eq("status_id", filtros.status_id);

  const { data, error } = await query;
  if (error) {
    console.error("[getMeusAtendimentos]", error.message);
    throw new Error("Falha ao carregar atendimentos.");
  }
  return (data ?? []) as unknown as AtendimentoComJoins[];
}

export async function getAtendimento(id: string): Promise<AtendimentoComJoins | null> {
  const supabase = await createClient();
  await getRequiredUser(); // CRITICAL: garante sessão autenticada além do RLS

  const { data, error } = await supabase
    .from("atendimentos")
    .select(SELECT_JOINS)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as AtendimentoComJoins;
}

// ── Mutations ──────────────────────────────────────────────────────────────

const criarSchema = z.object({
  beneficiario_id: z.string().min(1, "Selecione um beneficiário"),
  setor_id: z.string().min(1, "Selecione um setor"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  prioritario: z.boolean(),
  anotacoes: z.string().max(5000, "Anotações muito longas (máximo 5.000 caracteres)").optional(),
});

export type CriarAtendimentoData = z.infer<typeof criarSchema>;

export async function criarAtendimento(
  raw: CriarAtendimentoData
): Promise<ActionResult<{ id: string }>> {
  const parsed = criarSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const user = await getRequiredUser();

  if (user.role !== "admin" && user.role !== "entrevistador" && user.role !== "recepcionista") {
    return { ok: false, error: "Sem permissão para criar atendimentos." };
  }

  const { data: statusInicial, error: statusErr } = await supabase
    .from("status_atendimento")
    .select("id")
    .order("ordem", { ascending: true })
    .limit(1)
    .single();

  if (statusErr || !statusInicial) return { ok: false, error: "Nenhum status configurado." };

  const { data, error } = await supabase
    .from("atendimentos")
    .insert({
      beneficiario_id: parsed.data.beneficiario_id,
      setor_id: parsed.data.setor_id,
      servico_id: parsed.data.servico_id,
      status_id: statusInicial.id,
      criado_por: user.id,
      prioritario: parsed.data.prioritario,
      anotacoes: parsed.data.anotacoes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[criarAtendimento]", error.message);
    return { ok: false, error: "Falha ao criar atendimento. Tente novamente." };
  }

  revalidatePath("/atendimentos");
  return { ok: true, data: { id: data.id } };
}

export async function assumirAtendimento(id: string): Promise<ActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID de atendimento inválido." };

  const supabase = await createClient();
  const user = await getRequiredUser();

  if (user.role !== "admin" && user.role !== "entrevistador") {
    return { ok: false, error: "Sem permissão para assumir atendimentos." };
  }

  // Busca os dois primeiros status por ordem: [0]=aguardando, [1]=em atendimento
  const { data: statusList, error: statusErr } = await supabase
    .from("status_atendimento")
    .select("id, ordem")
    .order("ordem", { ascending: true })
    .limit(2);

  if (statusErr) return { ok: false, error: "Erro ao buscar configuração de status." };
  if (!statusList || statusList.length < 2) {
    return { ok: false, error: "Configuração de status incompleta. Contate o administrador." };
  }

  const statusEmAtendimento = statusList[1];

  // UPDATE condicional atômico: só atualiza se servidor_id ainda é NULL (evita race condition)
  const { data, error } = await supabase
    .from("atendimentos")
    .update({
      servidor_id: user.id,
      assumido_em: new Date().toISOString(),
      status_id: statusEmAtendimento.id,
    })
    .eq("id", id)
    .is("servidor_id", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[assumirAtendimento]", error.message);
    return { ok: false, error: "Falha ao assumir atendimento. Tente novamente." };
  }
  if (!data) return { ok: false, error: "Atendimento já foi assumido por outro servidor." };

  await registrarAuditoria({
    userId: user.id,
    action: "assumir_atendimento",
    entity: "atendimentos",
    entityId: id,
  });

  revalidatePath("/atendimentos");
  revalidatePath(`/atendimentos/${id}`);
  return { ok: true, data: undefined };
}

export async function atualizarStatus(
  id: string,
  status_id: string
): Promise<ActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID de atendimento inválido." };

  const statusParsed = uuidSchema.safeParse(status_id);
  if (!statusParsed.success) return { ok: false, error: "Status inválido." };

  const supabase = await createClient();
  const user = await getRequiredUser();

  // CRITICAL: apenas admin e entrevistador podem editar
  if (user.role !== "admin" && user.role !== "entrevistador") {
    return { ok: false, error: "Sem permissão para editar atendimentos." };
  }

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("servidor_id, concluido_em")
    .eq("id", id)
    .single();

  if (!atendimento) return { ok: false, error: "Atendimento não encontrado." };
  if (atendimento.concluido_em) return { ok: false, error: "Atendimento já concluído." };
  if (user.role === "entrevistador" && atendimento.servidor_id !== user.id) {
    return { ok: false, error: "Sem permissão para editar este atendimento." };
  }

  const { error } = await supabase
    .from("atendimentos")
    .update({ status_id })
    .eq("id", id);

  if (error) {
    console.error("[atualizarStatus]", error.message);
    return { ok: false, error: "Falha ao atualizar status. Tente novamente." };
  }

  revalidatePath(`/atendimentos/${id}`);
  revalidatePath("/atendimentos");
  return { ok: true, data: undefined };
}

export async function atualizarAnotacoes(
  id: string,
  anotacoes: string
): Promise<ActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID de atendimento inválido." };

  const anotacoesParsed = z
    .string()
    .max(5000, "Anotações muito longas (máximo 5.000 caracteres)")
    .safeParse(anotacoes);
  if (!anotacoesParsed.success) return { ok: false, error: anotacoesParsed.error.issues[0].message };

  const supabase = await createClient();
  const user = await getRequiredUser();

  // CRITICAL: apenas admin e entrevistador podem editar
  if (user.role !== "admin" && user.role !== "entrevistador") {
    return { ok: false, error: "Sem permissão para editar atendimentos." };
  }

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("servidor_id, concluido_em")
    .eq("id", id)
    .single();

  if (!atendimento) return { ok: false, error: "Atendimento não encontrado." };
  if (atendimento.concluido_em) return { ok: false, error: "Atendimento já concluído." };
  if (user.role === "entrevistador" && atendimento.servidor_id !== user.id) {
    return { ok: false, error: "Sem permissão para editar este atendimento." };
  }

  const { error } = await supabase
    .from("atendimentos")
    .update({ anotacoes: anotacoes.trim() || null })
    .eq("id", id);

  if (error) {
    console.error("[atualizarAnotacoes]", error.message);
    return { ok: false, error: "Falha ao salvar anotações. Tente novamente." };
  }

  revalidatePath(`/atendimentos/${id}`);
  return { ok: true, data: undefined };
}

export async function concluirAtendimento(id: string): Promise<ActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID de atendimento inválido." };

  const supabase = await createClient();
  const user = await getRequiredUser();

  // CRITICAL: apenas admin e entrevistador podem concluir
  if (user.role !== "admin" && user.role !== "entrevistador") {
    return { ok: false, error: "Sem permissão para concluir atendimentos." };
  }

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("servidor_id, concluido_em")
    .eq("id", id)
    .single();

  if (!atendimento) return { ok: false, error: "Atendimento não encontrado." };
  if (atendimento.concluido_em) return { ok: false, error: "Atendimento já concluído." };
  if (user.role === "entrevistador" && atendimento.servidor_id !== user.id) {
    return { ok: false, error: "Sem permissão para concluir este atendimento." };
  }

  const { data: statusConcluido, error: statusErr } = await supabase
    .from("status_atendimento")
    .select("id")
    .ilike("nome", "conclu%")
    .limit(1)
    .single();

  if (statusErr || !statusConcluido) {
    return { ok: false, error: "Status 'Concluído' não encontrado. Contate o administrador." };
  }

  const { error } = await supabase
    .from("atendimentos")
    .update({
      concluido_em: new Date().toISOString(),
      status_id: statusConcluido.id,
    })
    .eq("id", id);

  if (error) {
    console.error("[concluirAtendimento]", error.message);
    return { ok: false, error: "Falha ao concluir atendimento. Tente novamente." };
  }

  await registrarAuditoria({
    userId: user.id,
    action: "concluir_atendimento",
    entity: "atendimentos",
    entityId: id,
  });

  revalidatePath(`/atendimentos/${id}`);
  revalidatePath("/atendimentos");
  return { ok: true, data: undefined };
}

export async function trocarEntrevistador(
  id: string,
  novo_servidor_id: string
): Promise<ActionResult> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID de atendimento inválido." };

  const servidorParsed = uuidSchema.safeParse(novo_servidor_id);
  if (!servidorParsed.success) return { ok: false, error: "Servidor inválido." };

  const supabase = await createClient();
  const user = await getRequiredUser();

  if (user.role !== "admin") {
    return { ok: false, error: "Apenas administradores podem trocar o entrevistador." };
  }

  const { data: novoPerfil } = await supabase
    .from("perfis")
    .select("id, role, ativo")
    .eq("id", novo_servidor_id)
    .single();

  if (!novoPerfil) return { ok: false, error: "Servidor não encontrado." };
  if (!novoPerfil.ativo) return { ok: false, error: "Servidor inativo." };
  if (novoPerfil.role !== "entrevistador" && novoPerfil.role !== "admin") {
    return { ok: false, error: "O servidor selecionado não é entrevistador." };
  }

  const { data: atendimento } = await supabase
    .from("atendimentos")
    .select("concluido_em")
    .eq("id", id)
    .single();

  if (!atendimento) return { ok: false, error: "Atendimento não encontrado." };
  if (atendimento.concluido_em) {
    return { ok: false, error: "Não é possível alterar um atendimento já concluído." };
  }

  const { error } = await supabase
    .from("atendimentos")
    .update({
      servidor_id: novo_servidor_id,
      assumido_em: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[trocarEntrevistador]", error.message);
    return { ok: false, error: "Falha ao trocar entrevistador. Tente novamente." };
  }

  await registrarAuditoria({
    userId: user.id,
    action: "trocar_entrevistador",
    entity: "atendimentos",
    entityId: id,
    payload: { novo_servidor_id },
  });

  revalidatePath(`/atendimentos/${id}`);
  revalidatePath("/atendimentos");
  return { ok: true, data: undefined };
}
