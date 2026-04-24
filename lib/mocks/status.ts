import type { StatusAtendimento } from "@/lib/types";

export const mockStatus: StatusAtendimento[] = [
  { id: "st1", nome: "Aguardando", cor: "#f59e0b", ordem: 1, ativo: true },
  { id: "st2", nome: "Em Atendimento", cor: "#3b82f6", ordem: 2, ativo: true },
  { id: "st3", nome: "Concluído", cor: "#22c55e", ordem: 3, ativo: true },
  { id: "st4", nome: "Cancelado", cor: "#ef4444", ordem: 4, ativo: true },
  { id: "st5", nome: "Pendente Documentação", cor: "#a855f7", ordem: 5, ativo: true },
];
