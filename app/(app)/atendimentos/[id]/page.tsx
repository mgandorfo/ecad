import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequiredUser } from "@/lib/supabase/auth";
import { getAtendimento } from "@/app/(app)/atendimentos/actions";
import { AtendimentoDetalheClient } from "@/components/atendimentos/atendimento-detalhe-client";
import type { Perfil, StatusAtendimento } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AtendimentoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getRequiredUser();

  const [atendimento, statusResult, entrevistadoresResult] = await Promise.all([
    getAtendimento(id),
    supabase.from("status_atendimento").select("*").eq("ativo", true).order("ordem"),
    supabase
      .from("perfis")
      .select("*")
      .in("role", ["entrevistador", "admin"])
      .eq("ativo", true)
      .order("nome"),
  ]);

  if (!atendimento) notFound();

  const allStatus = (statusResult.data ?? []) as StatusAtendimento[];
  const entrevistadores = (entrevistadoresResult.data ?? []) as Perfil[];

  return (
    <AtendimentoDetalheClient
      atendimento={atendimento}
      allStatus={allStatus}
      entrevistadores={entrevistadores}
      userId={user.id}
    />
  );
}
