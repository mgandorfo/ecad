"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Setor } from "@/lib/types";

const schema = z.object({
  codigo: z.string().min(1, "Código obrigatório").max(10, "Máximo 10 caracteres"),
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
});

export type SetorFormData = z.infer<typeof schema>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listarSetores(search = "", page = 1, pageSize = 10): Promise<{ items: Setor[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("setores")
    .select("*", { count: "exact" })
    .order("nome");

  if (search.trim()) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[listarSetores]", error.message);
    throw new Error("Falha ao buscar setores.");
  }
  return { items: (data ?? []) as Setor[], total: count ?? 0 };
}

export async function criarSetor(raw: SetorFormData): Promise<ActionResult<Setor>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("setores")
    .insert({ codigo: parsed.data.codigo, nome: parsed.data.nome, ativo: true })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um setor com este código." };
    console.error("[criarSetor]", error.message);
    return { ok: false, error: "Falha ao salvar setor. Tente novamente." };
  }

  revalidatePath("/admin/setores");
  return { ok: true, data: data as Setor };
}

export async function atualizarSetor(id: string, raw: SetorFormData): Promise<ActionResult<Setor>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("setores")
    .update({ codigo: parsed.data.codigo, nome: parsed.data.nome })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um setor com este código." };
    console.error("[atualizarSetor]", error.message);
    return { ok: false, error: "Falha ao atualizar setor. Tente novamente." };
  }

  revalidatePath("/admin/setores");
  return { ok: true, data: data as Setor };
}

export async function excluirSetor(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("setores").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") return { ok: false, error: "Este setor possui serviços vinculados e não pode ser excluído." };
    console.error("[excluirSetor]", error.message);
    return { ok: false, error: "Falha ao excluir setor. Tente novamente." };
  }

  revalidatePath("/admin/setores");
  return { ok: true, data: undefined };
}
