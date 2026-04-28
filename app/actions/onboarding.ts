"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getRequiredUser } from "@/lib/supabase/auth";

const onboardingSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres").trim(),
});

export type OnboardingState = {
  error?: string;
} | null;

export async function concluirOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await getRequiredUser();

  const parsed = onboardingSchema.safeParse({ nome: formData.get("nome") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Verificar se ainda não há nenhum admin (race condition: dois admins ao mesmo tempo)
  const { data: jaTemAdmin } = await supabase
    .rpc("primeiro_admin_pendente");

  if (!jaTemAdmin) {
    // Já existe um admin — redirecionar direto sem promover
    redirect("/dashboard");
  }

  // Atualizar o perfil do usuário: nome + promover a admin
  const { error } = await supabase
    .from("perfis")
    .update({ nome: parsed.data.nome, role: "admin" })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível concluir a configuração. Tente novamente." };
  }

  redirect("/dashboard");
}
