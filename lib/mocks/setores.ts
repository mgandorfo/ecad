import type { Setor } from "@/lib/types";

export const mockSetores: Setor[] = [
  { id: "s1", codigo: "BPC", nome: "BPC - Benefício de Prestação Continuada", ativo: true },
  { id: "s2", codigo: "CAD", nome: "CadÚnico - Cadastro Único", ativo: true },
  { id: "s3", codigo: "PBF", nome: "Programa Bolsa Família", ativo: true },
  { id: "s4", codigo: "CRAS", nome: "CRAS - Centro de Referência", ativo: true },
  { id: "s5", codigo: "HBT", nome: "Habitação", ativo: false },
];
