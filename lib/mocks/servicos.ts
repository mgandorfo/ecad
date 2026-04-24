import type { Servico } from "@/lib/types";

export const mockServicos: Servico[] = [
  { id: "sv1", codigo: "CAD-INC", nome: "Inclusão no CadÚnico", setor_id: "s2", ativo: true },
  { id: "sv2", codigo: "CAD-ATU", nome: "Atualização cadastral", setor_id: "s2", ativo: true },
  { id: "sv3", codigo: "CAD-EXC", nome: "Exclusão de membro", setor_id: "s2", ativo: true },
  { id: "sv4", codigo: "BPC-SOL", nome: "Solicitação BPC", setor_id: "s1", ativo: true },
  { id: "sv5", codigo: "BPC-REV", nome: "Revisão BPC", setor_id: "s1", ativo: true },
  { id: "sv6", codigo: "PBF-CAD", nome: "Cadastramento PBF", setor_id: "s3", ativo: true },
  { id: "sv7", codigo: "PBF-DES", nome: "Desbloqueio PBF", setor_id: "s3", ativo: true },
  { id: "sv8", codigo: "CRAS-ATD", nome: "Atendimento CRAS", setor_id: "s4", ativo: true },
];
