import { BeneficiarioGuard } from "@/components/beneficiarios/beneficiario-guard";
import { BeneficiariosClient } from "@/components/beneficiarios/beneficiarios-client";
import { listarBeneficiarios } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function BeneficiariosPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const { items, total } = await listarBeneficiarios(q, pageNum);

  return (
    <BeneficiarioGuard>
      <BeneficiariosClient initialItems={items} initialTotal={total} />
    </BeneficiarioGuard>
  );
}
