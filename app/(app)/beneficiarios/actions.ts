"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateCpf, stripCpf } from "@/lib/utils/cpf";
import type { Beneficiario } from "@/lib/types";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(150),
  cpf: z
    .string()
    .min(1, "CPF obrigatório")
    .refine((v) => validateCpf(v), "CPF inválido"),
  logradouro: z.string().max(200).optional(),
  numero: z.string().max(10).optional(),
  complemento: z.string().max(100).optional(),
  bairro: z.string().max(100).optional(),
  cidade: z.string().max(100).optional(),
  uf: z.string().length(2, "UF inválida").or(z.literal("")).optional(),
  cep: z.string().max(9).optional(),
  prioritario: z.boolean().default(false),
});

export type BeneficiarioFormData = z.infer<typeof schema>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listarBeneficiarios(
  search = "",
  page = 1,
  pageSize = 10
): Promise<{ items: Beneficiario[]; total: number }> {
  const supabase = await createClient();
  // autenticação garantida pelo RLS — createClient() já valida a sessão SSR
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("beneficiarios")
    .select("*", { count: "exact" })
    .order("nome");

  if (search.trim()) {
    const cpfDigits = search.replace(/\D/g, "");
    if (cpfDigits.length >= 3) {
      query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${cpfDigits}%`);
    } else {
      query = query.ilike("nome", `%${search}%`);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[listarBeneficiarios]", error.message);
    throw new Error("Falha ao buscar beneficiários.");
  }
  return { items: (data ?? []) as Beneficiario[], total: count ?? 0 };
}

export async function buscarBeneficiario(id: string): Promise<Beneficiario | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beneficiarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Beneficiario;
}

export async function criarBeneficiario(raw: BeneficiarioFormData): Promise<ActionResult<Beneficiario>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beneficiarios")
    .insert({
      nome: parsed.data.nome,
      cpf: stripCpf(parsed.data.cpf),
      logradouro: parsed.data.logradouro || null,
      numero: parsed.data.numero || null,
      complemento: parsed.data.complemento || null,
      bairro: parsed.data.bairro || null,
      cidade: parsed.data.cidade || null,
      uf: parsed.data.uf || null,
      cep: parsed.data.cep ? parsed.data.cep.replace(/\D/g, "") : null,
      prioritario: parsed.data.prioritario,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um beneficiário com este CPF." };
    if (error.code === "23514") return { ok: false, error: "CPF inválido." };
    console.error("[criarBeneficiario]", error.message);
    return { ok: false, error: "Falha ao salvar beneficiário. Tente novamente." };
  }

  revalidatePath("/beneficiarios");
  return { ok: true, data: data as Beneficiario };
}

export async function atualizarBeneficiario(id: string, raw: BeneficiarioFormData): Promise<ActionResult<Beneficiario>> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beneficiarios")
    .update({
      nome: parsed.data.nome,
      cpf: stripCpf(parsed.data.cpf),
      logradouro: parsed.data.logradouro || null,
      numero: parsed.data.numero || null,
      complemento: parsed.data.complemento || null,
      bairro: parsed.data.bairro || null,
      cidade: parsed.data.cidade || null,
      uf: parsed.data.uf || null,
      cep: parsed.data.cep ? parsed.data.cep.replace(/\D/g, "") : null,
      prioritario: parsed.data.prioritario,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um beneficiário com este CPF." };
    if (error.code === "23514") return { ok: false, error: "CPF inválido." };
    console.error("[atualizarBeneficiario]", error.message);
    return { ok: false, error: "Falha ao atualizar beneficiário. Tente novamente." };
  }

  revalidatePath("/beneficiarios");
  revalidatePath(`/beneficiarios/${id}`);
  return { ok: true, data: data as Beneficiario };
}

export async function excluirBeneficiario(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("beneficiarios").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") return { ok: false, error: "Este beneficiário possui atendimentos e não pode ser excluído." };
    console.error("[excluirBeneficiario]", error.message);
    return { ok: false, error: "Falha ao excluir beneficiário. Tente novamente." };
  }

  revalidatePath("/beneficiarios");
  return { ok: true, data: undefined };
}
