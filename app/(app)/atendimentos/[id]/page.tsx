import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequiredUser } from "@/lib/supabase/auth";
import { getAtendimento } from "@/app/(app)/atendimentos/actions";
import { AtendimentoDetalheClient } from "@/components/atendimentos/atendimento-detalhe-client";
import type { Perfil, Servico, StatusAtendimento } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AtendimentoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getRequiredUser();

  const atendimento = await getAtendimento(id);
  if (!atendimento) notFound();

  const [statusResult, entrevistadoresResult, servicosResult] = await Promise.all([
    supabase.from("status_atendimento").select("*").eq("ativo", true).order("ordem"),
    supabase
      .from("perfis")
      .select("*")
      .in("role", ["entrevistador", "admin"])
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("servicos")
      .select("*")
      .eq("setor_id", atendimento.setor_id)
      .eq("ativo", true)
      .order("nome"),
  ]);

  const allStatus = (statusResult.data ?? []) as StatusAtendimento[];
  const entrevistadores = (entrevistadoresResult.data ?? []) as Perfil[];
  const servicos = (servicosResult.data ?? []) as Servico[];

  return (
    <AtendimentoDetalheClient
      atendimento={atendimento}
      allStatus={allStatus}
      entrevistadores={entrevistadores}
      servicos={servicos}
      userId={user.id}
    />
  );
}
