"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimentos/atendimento-form";
import { useRole } from "@/lib/role-context";
import { RoleGuard } from "@/components/layout/role-guard";
import { atendimentosStore } from "@/lib/stores/atendimentos";
import { mockSetores } from "@/lib/mocks/setores";
import { mockServicos } from "@/lib/mocks/servicos";
import { mockStatus } from "@/lib/mocks/status";
import { mockUsuarios } from "@/lib/mocks/usuarios";
import type { Beneficiario } from "@/lib/types";

const SERVIDOR_MOCK_ID = "u2";

export default function NovoAtendimentoPage() {
  const router = useRouter();
  const role = useRole();

  async function handleSave(data: AtendimentoFormData, beneficiario: Beneficiario) {
    await new Promise((r) => setTimeout(r, 400));

    const statusInicial = mockStatus.find((s) => s.ordem === 1) ?? mockStatus[0];
    const setor = mockSetores.find((s) => s.id === data.setor_id);
    const servico = mockServicos.find((s) => s.id === data.servico_id);
    const servidor = mockUsuarios.find((u) => u.id === SERVIDOR_MOCK_ID);

    atendimentosStore.add({
      id: `a${Date.now()}`,
      beneficiario_id: data.beneficiario_id,
      setor_id: data.setor_id,
      servico_id: data.servico_id,
      status_id: statusInicial.id,
      servidor_id: null,
      prioritario: data.prioritario,
      anotacoes: data.anotacoes ?? null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      concluido_em: null,
      beneficiario,
      setor,
      servico,
      status: statusInicial,
      servidor: undefined,
    });

    toast.success("Atendimento registrado na fila.");
    router.push("/fila");
  }

  return (
    <RoleGuard
      roles={["admin", "entrevistador", "recepcionista"]}
      currentRole={role}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Novo Atendimento"
          description="Registre um novo atendimento na fila"
          actions={
            <Link
              href="/fila"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeftIcon />
              Voltar
            </Link>
          }
        />
        <div className="max-w-2xl">
          <AtendimentoForm onSave={handleSave} />
        </div>
      </div>
    </RoleGuard>
  );
}
