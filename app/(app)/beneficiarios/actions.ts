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
  logradouro: z.string().min(1, "Logradouro obrigatório").max(200),
  numero: z.string().min(1, "Número obrigatório").max(10),
  complemento: z.string().max(100).optional(),
  bairro: z.string().min(1, "Bairro obrigatório").max(100),
  cidade: z.string().min(1, "Cidade obrigatória").max(100),
  uf: z.string().length(2, "UF inválida"),
  cep: z.string().max(9).optional(),
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

  if (error) throw new Error(error.message);
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
      logradouro: parsed.data.logradouro,
      numero: parsed.data.numero,
      complemento: parsed.data.complemento ?? null,
      bairro: parsed.data.bairro,
      cidade: parsed.data.cidade,
      uf: parsed.data.uf,
      cep: parsed.data.cep ? parsed.data.cep.replace(/\D/g, "") : null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um beneficiário com este CPF." };
    if (error.code === "23514") return { ok: false, error: "CPF inválido." };
    return { ok: false, error: error.message };
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
      logradouro: parsed.data.logradouro,
      numero: parsed.data.numero,
      complemento: parsed.data.complemento ?? null,
      bairro: parsed.data.bairro,
      cidade: parsed.data.cidade,
      uf: parsed.data.uf,
      cep: parsed.data.cep ? parsed.data.cep.replace(/\D/g, "") : null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Já existe um beneficiário com este CPF." };
    if (error.code === "23514") return { ok: false, error: "CPF inválido." };
    return { ok: false, error: error.message };
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
    return { ok: false, error: error.message };
  }

  revalidatePath("/beneficiarios");
  return { ok: true, data: undefined };
}
