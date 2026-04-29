"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarAuditoria } from "@/lib/supabase/audit";
import { getRequiredUser } from "@/lib/supabase/auth";
import type { Perfil, Role } from "@/lib/types";

const updateSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  role: z.enum(["admin", "entrevistador", "recepcionista", "vigilancia"]),
});

const createSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório").max(100, "Máximo 100 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "entrevistador", "recepcionista", "vigilancia"]),
});

export type UsuarioCreateData = z.infer<typeof createSchema>;
export type UsuarioUpdateData = z.infer<typeof updateSchema>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listarUsuarios(search = "", page = 1, pageSize = 10): Promise<{ items: Perfil[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("perfis")
    .select("*", { count: "exact" })
    .order("nome");

  if (search.trim()) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[listarUsuarios]", error.message);
    throw new Error("Falha ao buscar usuários.");
  }
  return { items: (data ?? []) as Perfil[], total: count ?? 0 };
}

export async function convidarUsuario(raw: UsuarioCreateData): Promise<ActionResult<Perfil>> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Verifica se o e-mail já existe no perfil
  const { data: existing } = await supabase
    .from("perfis")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "Já existe um usuário com este e-mail." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Envia convite por e-mail — o usuário recebe um link para definir a própria senha
  const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl}/auth/callback?next=/redefinir`,
      data: { nome: parsed.data.nome },
    }
  );

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { ok: false, error: "Já existe um usuário com este e-mail." };
    }
    console.error("[convidarUsuario] auth", authError.message);
    return { ok: false, error: "Falha ao enviar convite. Tente novamente." };
  }

  // Atualiza o perfil criado pelo trigger com o nome e role corretos (service role ignora RLS)
  const { data: perfil, error: perfilError } = await adminClient
    .from("perfis")
    .update({ nome: parsed.data.nome, role: parsed.data.role as Role })
    .eq("id", authData.user.id)
    .select()
    .single();

  if (perfilError) {
    console.error("[convidarUsuario] perfil", perfilError.message);
    return { ok: false, error: "Usuário criado, mas falha ao configurar perfil. Contate o administrador." };
  }

  const actor = await getRequiredUser();
  await registrarAuditoria({
    userId: actor.id,
    action: "criar_usuario",
    entity: "perfis",
    entityId: authData.user.id,
    payload: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, data: perfil as Perfil };
}

export async function atualizarUsuario(id: string, raw: UsuarioUpdateData): Promise<ActionResult<Perfil>> {
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfis")
    .update({ nome: parsed.data.nome, role: parsed.data.role as Role })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[atualizarUsuario]", error.message);
    return { ok: false, error: "Falha ao atualizar usuário. Tente novamente." };
  }

  const actor = await getRequiredUser();
  await registrarAuditoria({
    userId: actor.id,
    action: "alterar_role_usuario",
    entity: "perfis",
    entityId: id,
    payload: { role: parsed.data.role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, data: data as Perfil };
}

export async function excluirUsuario(id: string): Promise<ActionResult> {
  const actor = await getRequiredUser();
  const adminClient = createAdminClient();

  // Deleta o usuário do Auth (o trigger cuida da limpeza do perfil via CASCADE)
  const { error } = await adminClient.auth.admin.deleteUser(id);

  if (error) {
    console.error("[excluirUsuario]", error.message);
    return { ok: false, error: "Falha ao excluir usuário. Tente novamente." };
  }

  await registrarAuditoria({
    userId: actor.id,
    action: "excluir_usuario",
    entity: "perfis",
    entityId: id,
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, data: undefined };
}
