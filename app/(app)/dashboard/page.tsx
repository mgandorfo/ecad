import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "./actions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Periodo } from "@/lib/dashboard-utils";

const PERIODOS = ["7d", "30d", "mes"] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  // Recepcionista não tem acesso ao dashboard
  if (!user || user.role === "recepcionista") redirect("/atendimentos");

  const sp = await searchParams;

  const periodoRaw = sp.periodo as string;
  const periodo: Periodo = (PERIODOS as readonly string[]).includes(periodoRaw)
    ? (periodoRaw as Periodo)
    : "7d";
  const setorId = (sp.setor as string) || "";
  const servidorId = (sp.servidor as string) || "";

  const supabase = await createClient();

  // Todas as queries em paralelo
  const [data, setoresRes, servidoresRes] = await Promise.all([
    getDashboardData({ periodo, setorId, servidorId }),
    supabase.from("setores").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("perfis").select("id, nome").eq("role", "entrevistador").eq("ativo", true).order("nome"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos atendimentos"
      />
      <DashboardClient
        dashboardData={data}
        setores={setoresRes.data ?? []}
        servidores={servidoresRes.data ?? []}
        role={user.role}
        servidorAtualId={user.id}
        periodo={periodo}
        setorId={setorId}
        servidorId={servidorId}
      />
    </div>
  );
}
