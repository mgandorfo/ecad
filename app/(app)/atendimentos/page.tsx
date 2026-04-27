import { Suspense } from "react";
import { AtendimentosPageClient } from "@/components/atendimentos/atendimentos-page-client";

export default function AtendimentosPage() {
  return (
    <Suspense>
      <AtendimentosPageClient />
    </Suspense>
  );
}
