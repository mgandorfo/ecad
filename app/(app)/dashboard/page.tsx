import { PageHeader } from "@/components/layout/page-header";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { mockAtendimentos } from "@/lib/mocks/atendimentos";
import { mockSetores } from "@/lib/mocks/setores";
import { mockUsuarios } from "@/lib/mocks/usuarios";

export default function DashboardPage() {
  const servidores = mockUsuarios.filter(
    (u) => u.role === "entrevistador" && u.ativo
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos atendimentos"
      />
      <DashboardWrapper
        atendimentos={mockAtendimentos}
        setores={mockSetores.filter((s) => s.ativo)}
        servidores={servidores}
      />
    </div>
  );
}
