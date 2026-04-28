"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import type { Role } from "@/lib/types";

const redirectByRole: Record<Role, string> = {
  admin: "/dashboard",
  entrevistador: "/atendimentos",
  recepcionista: "/atendimentos/novo",
  vigilancia: "/relatorios",
};

const VALID_ROLES: Role[] = ["admin", "entrevistador", "recepcionista", "vigilancia"];
function isValidRole(r: unknown): r is Role {
  return VALID_ROLES.includes(r as Role);
}

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type LoginState = {
  error?: string;
} | null;

export async function signIn(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "E-mail ou senha incorretos." };
    }
    return { error: "Não foi possível entrar. Tente novamente." };
  }

  // Se não houver admin algum no sistema → onboarding do primeiro admin
  const { data: primeiroAdminPendente, error: rpcError } = await supabase
    .rpc("primeiro_admin_pendente");

  if (rpcError) {
    console.error("[signIn] primeiro_admin_pendente RPC error:", rpcError.message);
  }

  if (!rpcError && primeiroAdminPendente) {
    redirect("/onboarding");
  }

  // Buscar role do usuário recém-autenticado para redirecionar corretamente
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "Sessão inválida. Tente novamente." };
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", authUser.id)
    .single();

  const destino = isValidRole(perfil?.role) ? redirectByRole[perfil.role] : "/dashboard";
  redirect(destino);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Recuperar senha ──────────────────────────────────────────────────────────

const recuperarSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export type RecuperarState = {
  error?: string;
  success?: boolean;
} | null;

export async function recuperarSenha(
  _prev: RecuperarState,
  formData: FormData
): Promise<RecuperarState> {
  const parsed = recuperarSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/redefinir` }
  );

  if (error) {
    return { error: "Não foi possível enviar o e-mail. Tente novamente." };
  }

  return { success: true };
}

// ─── Redefinir senha ──────────────────────────────────────────────────────────

const redefinirSchema = z
  .object({
    senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, {
    message: "As senhas não coincidem",
    path: ["confirmacao"],
  });

export type RedefinirState = {
  error?: string;
  fieldErrors?: { senha?: string[]; confirmacao?: string[] };
} | null;

export async function redefinirSenha(
  _prev: RedefinirState,
  formData: FormData
): Promise<RedefinirState> {
  const parsed = redefinirSchema.safeParse({
    senha: formData.get("senha"),
    confirmacao: formData.get("confirmacao"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.senha,
  });

  if (error) {
    return { error: "Não foi possível redefinir a senha. O link pode ter expirado." };
  }

  redirect("/login?redefinido=1");
}
