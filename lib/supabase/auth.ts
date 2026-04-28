import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Perfil, Role } from "@/lib/types";

export const getCurrentUser = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .single();

  return perfil ?? null;
});

export const getRequiredUser = cache(async (): Promise<Perfil> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

export async function getCurrentRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}
