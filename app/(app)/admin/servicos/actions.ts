"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Servico, Setor } from "@/lib/types";

const schema = z.object({
  codigo: z.string().min(1, "Código obrigatório").max(15, "Máximo 15 caracteres"),
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  setor_id: z.string().min(1, "Setor obrigatório"),
});

export type ServicoFormData = z.infer<typeof schema>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listarServicos(search = "", page = 1, pageSize = 10): Promise<{ items: Servico[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("servicos")
    .select("*", { count: "exact" })
    .order("nome");

  if (search.trim()) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[listarServicos]", error.message);
    throw new Error("Falha ao buscar serviços.");
  }
  return { items: (data ?? []) as Servico[], total: count ?? 0 };
}

export async function listarSetoresAtivos(): Promise<Setor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("setores")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[listarSetoresAtivos]", error.message);
    throw new Error("Falha ao buscar setores.");
  }
  return (data ?? []) as Setor[];
}

export async function criarServico(raw: ServicoFormData): Promise<ActionResult<Servico>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .insert({ codigo: parsed.data.codigo, nome: parsed.data.nome, setor_id: parsed.data.setor_id, ativo: true })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um serviço com este código." };
    console.error("[criarServico]", error.message);
    return { ok: false, error: "Falha ao salvar serviço. Tente novamente." };
  }

  revalidatePath("/admin/servicos");
  return { ok: true, data: data as Servico };
}

export async function atualizarServico(id: string, raw: ServicoFormData): Promise<ActionResult<Servico>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicos")
    .update({ codigo: parsed.data.codigo, nome: parsed.data.nome, setor_id: parsed.data.setor_id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um serviço com este código." };
    console.error("[atualizarServico]", error.message);
    return { ok: false, error: "Falha ao atualizar serviço. Tente novamente." };
  }

  revalidatePath("/admin/servicos");
  return { ok: true, data: data as Servico };
}

export async function toggleAtivoServico(id: string): Promise<ActionResult<Servico>> {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("servicos")
    .select("ativo")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return { ok: false, error: "Serviço não encontrado." };
  }

  const { data, error } = await supabase
    .from("servicos")
    .update({ ativo: !current.ativo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[toggleAtivoServico]", error.message);
    return { ok: false, error: "Falha ao atualizar status do serviço." };
  }

  revalidatePath("/admin/servicos");
  return { ok: true, data: data as Servico };
}

export async function excluirServico(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("servicos").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") return { ok: false, error: "Este serviço possui atendimentos vinculados e não pode ser excluído." };
    console.error("[excluirServico]", error.message);
    return { ok: false, error: "Falha ao excluir serviço. Tente novamente." };
  }

  revalidatePath("/admin/servicos");
  return { ok: true, data: undefined };
}
