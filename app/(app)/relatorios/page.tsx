import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { RelatoriosClient } from "@/components/relatorios/relatorios-client";
import { getRelatorios } from "./actions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  // Recepcionista não tem acesso aos relatórios
  if (!user || user.role === "recepcionista") redirect("/atendimentos");

  const sp = await searchParams;

  // Validar searchParams antes de usar
  const pageRaw = Number(sp.page);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const deRaw = sp.de as string;
  const ateRaw = sp.ate as string;

  const filtros = {
    busca: (sp.busca as string) || "",
    setorId: (sp.setor as string) || "",
    servicoId: (sp.servico as string) || "",
    statusId: (sp.status as string) || "",
    servidorId: (sp.servidor as string) || "",
    prioridade: (sp.prioridade as string) || "",
    dataInicio: ISO_DATE.test(deRaw) ? deRaw : "",
    dataFim: ISO_DATE.test(ateRaw) ? ateRaw : "",
    page,
  };

  const supabase = await createClient();

  // Todas as queries em paralelo
  const [resultado, setoresRes, servicosRes, statusRes, servidoresRes] = await Promise.all([
    getRelatorios(filtros),
    supabase.from("setores").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("servicos").select("id, nome, setor_id").eq("ativo", true).order("nome"),
    supabase.from("status_atendimento").select("id, nome, cor, ordem").eq("ativo", true).order("ordem"),
    supabase.from("perfis").select("id, nome").eq("role", "entrevistador").eq("ativo", true).order("nome"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Listagem filtrada e exportação de atendimentos"
      />
      <RelatoriosClient
        atendimentos={resultado.atendimentos}
        totalRegistros={resultado.total}
        setores={setoresRes.data ?? []}
        servicos={servicosRes.data ?? []}
        statusList={statusRes.data ?? []}
        servidores={servidoresRes.data ?? []}
        role={user.role}
        servidorAtualId={user.id}
        filtrosIniciais={filtros}
      />
    </div>
  );
}
