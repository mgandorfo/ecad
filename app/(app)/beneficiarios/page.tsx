import { BeneficiarioGuard } from "@/components/beneficiarios/beneficiario-guard";
import { BeneficiariosClient } from "@/components/beneficiarios/beneficiarios-client";

export default function BeneficiariosPage() {
  return (
    <BeneficiarioGuard>
      <BeneficiariosClient />
    </BeneficiarioGuard>
  );
}
