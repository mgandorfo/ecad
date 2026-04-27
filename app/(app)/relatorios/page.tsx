import { PageHeader } from "@/components/layout/page-header";
import { RelatoriosWrapper } from "@/components/relatorios/relatorios-wrapper";
import { mockAtendimentos } from "@/lib/mocks/atendimentos";
import { mockSetores } from "@/lib/mocks/setores";
import { mockServicos } from "@/lib/mocks/servicos";
import { mockStatus } from "@/lib/mocks/status";
import { mockUsuarios } from "@/lib/mocks/usuarios";

export default function RelatoriosPage() {
  const servidores = mockUsuarios.filter(
    (u) => u.role === "entrevistador" && u.ativo
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Listagem filtrada e exportação de atendimentos"
      />
      <RelatoriosWrapper
        atendimentos={mockAtendimentos}
        setores={mockSetores.filter((s) => s.ativo)}
        servicos={mockServicos.filter((s) => s.ativo)}
        statusList={mockStatus}
        servidores={servidores}
      />
    </div>
  );
}
