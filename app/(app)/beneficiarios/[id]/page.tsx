import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { BeneficiarioGuard } from "@/components/beneficiarios/beneficiario-guard";
import { BeneficiarioDetailClient } from "@/components/beneficiarios/beneficiario-detail-client";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { buscarBeneficiario } from "../actions";
import { createClient } from "@/lib/supabase/server";
import type { Atendimento } from "@/lib/types";
import { formatCpf } from "@/lib/utils/cpf";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BeneficiarioDetailPage({ params }: PageProps) {
  const { id } = await params;

  const beneficiario = await buscarBeneficiario(id);
  if (!beneficiario) notFound();

  const supabase = await createClient();
  const { data: atendimentos } = await supabase
    .from("atendimentos")
    .select("*, setor:setores(*), servico:servicos(*), status:status_atendimento(*)")
    .eq("beneficiario_id", id)
    .order("criado_em", { ascending: false });

  return (
    <BeneficiarioGuard>
      <BeneficiarioDetailClient
        beneficiario={beneficiario}
        atendimentos={(atendimentos ?? []) as Atendimento[]}
        cpfFormatado={formatCpf(beneficiario.cpf)}
      />
    </BeneficiarioGuard>
  );
}
