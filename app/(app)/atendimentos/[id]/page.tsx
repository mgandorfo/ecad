import { AtendimentoDetalheClient } from "@/components/atendimentos/atendimento-detalhe-client";

interface AtendimentoPageProps {
  params: Promise<{ id: string }>;
}

export default async function AtendimentoPage({ params }: AtendimentoPageProps) {
  const { id } = await params;
  return <AtendimentoDetalheClient id={id} />;
}
