"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { BeneficiarioGuard } from "@/components/beneficiarios/beneficiario-guard";
import { BeneficiarioForm, type BeneficiarioFormData } from "@/components/beneficiarios/beneficiario-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { mockBeneficiarios } from "@/lib/mocks";

export default function NovoBeneficiarioPage() {
  const router = useRouter();

  async function handleSave(data: BeneficiarioFormData) {
    await new Promise((r) => setTimeout(r, 500));
    const id = `b${Date.now()}`;
    mockBeneficiarios.unshift({
      id,
      nome: data.nome,
      cpf: data.cpf,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      uf: data.uf,
      cep: data.cep,
      criado_em: new Date().toISOString(),
    });
    toast.success("Beneficiário cadastrado com sucesso.");
    router.push("/beneficiarios");
  }

  return (
    <BeneficiarioGuard>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Novo Beneficiário"
          description="Preencha os dados para cadastrar um novo beneficiário"
          actions={
            <Link
              href="/beneficiarios"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeftIcon />
              Voltar
            </Link>
          }
        />
        <div className="max-w-2xl">
          <BeneficiarioForm onSave={handleSave} />
        </div>
      </div>
    </BeneficiarioGuard>
  );
}
