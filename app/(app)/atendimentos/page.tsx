import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { getRequiredUser } from "@/lib/supabase/auth";
import {
  getFilaAtendimentos,
  getMeusAtendimentos,
} from "@/app/(app)/atendimentos/actions";
import { AtendimentosPageClient } from "@/components/atendimentos/atendimentos-page-client";
import type { Setor, Servico, StatusAtendimento } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ setor?: string; servico?: string; status?: string; aba?: string }>;
}

async function AtendimentosContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  await getRequiredUser();

  const [filaResult, meusResult, setoresResult, servicosResult, statusResult] =
    await Promise.all([
      getFilaAtendimentos({
        setor_id: params.setor,
        servico_id: params.servico,
      }),
      getMeusAtendimentos({ status_id: params.status }),
      supabase.from("setores").select("*").eq("ativo", true).order("codigo"),
      supabase.from("servicos").select("*").eq("ativo", true).order("nome"),
      supabase.from("status_atendimento").select("*").eq("ativo", true).order("ordem"),
    ]);

  const setores = (setoresResult.data ?? []) as Setor[];
  const servicos = (servicosResult.data ?? []) as Servico[];
  const allStatus = (statusResult.data ?? []) as StatusAtendimento[];

  return (
    <AtendimentosPageClient
      fila={filaResult}
      meus={meusResult}
      setores={setores}
      servicos={servicos}
      allStatus={allStatus}
      filterSetorId={params.setor}
      filterServicoId={params.servico}
      filterStatusId={params.status}
    />
  );
}

function AtendimentosSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function AtendimentosPage(props: PageProps) {
  return (
    <Suspense fallback={<AtendimentosSkeleton />}>
      <AtendimentosContent {...props} />
    </Suspense>
  );
}
