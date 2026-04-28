"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { StatusAtendimento } from "@/lib/types";

const schema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(60, "Máximo 60 caracteres"),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use formato #rrggbb"),
  ordem: z
    .string()
    .min(1, "Ordem obrigatória")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Ordem deve ser um número maior que zero"),
});

export type StatusFormData = z.infer<typeof schema>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listarStatus(search = "", page = 1, pageSize = 10): Promise<{ items: StatusAtendimento[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("status_atendimento")
    .select("*", { count: "exact" })
    .order("ordem");

  if (search.trim()) {
    query = query.ilike("nome", `%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[listarStatus]", error.message);
    throw new Error("Falha ao buscar status.");
  }
  return { items: (data ?? []) as StatusAtendimento[], total: count ?? 0 };
}

export async function criarStatus(raw: StatusFormData): Promise<ActionResult<StatusAtendimento>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("status_atendimento")
    .insert({ nome: parsed.data.nome, cor: parsed.data.cor, ordem: Number(parsed.data.ordem), ativo: true })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um status com este nome." };
    console.error("[criarStatus]", error.message);
    return { ok: false, error: "Falha ao salvar status. Tente novamente." };
  }

  revalidatePath("/admin/status");
  return { ok: true, data: data as StatusAtendimento };
}

export async function atualizarStatus(id: string, raw: StatusFormData): Promise<ActionResult<StatusAtendimento>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("status_atendimento")
    .update({ nome: parsed.data.nome, cor: parsed.data.cor, ordem: Number(parsed.data.ordem) })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um status com este nome." };
    console.error("[atualizarStatus]", error.message);
    return { ok: false, error: "Falha ao atualizar status. Tente novamente." };
  }

  revalidatePath("/admin/status");
  return { ok: true, data: data as StatusAtendimento };
}

export async function excluirStatus(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("status_atendimento").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") return { ok: false, error: "Este status possui atendimentos vinculados e não pode ser excluído." };
    console.error("[excluirStatus]", error.message);
    return { ok: false, error: "Falha ao excluir status. Tente novamente." };
  }

  revalidatePath("/admin/status");
  return { ok: true, data: undefined };
}
