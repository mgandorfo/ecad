import type { Perfil } from "@/lib/types";

export const mockUsuarios: Perfil[] = [
  {
    id: "u1",
    nome: "Ana Souza",
    email: "ana.souza@caarapo.ms.gov.br",
    role: "admin",
    ativo: true,
    criado_em: "2024-01-10T08:00:00Z",
  },
  {
    id: "u2",
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@caarapo.ms.gov.br",
    role: "entrevistador",
    ativo: true,
    criado_em: "2024-01-15T08:00:00Z",
  },
  {
    id: "u3",
    nome: "Mariana Lima",
    email: "mariana.lima@caarapo.ms.gov.br",
    role: "recepcionista",
    ativo: true,
    criado_em: "2024-02-01T08:00:00Z",
  },
  {
    id: "u4",
    nome: "João Vigilante",
    email: "joao.vigilante@caarapo.ms.gov.br",
    role: "vigilancia",
    ativo: true,
    criado_em: "2024-02-10T08:00:00Z",
  },
  {
    id: "u5",
    nome: "Beatriz Alves",
    email: "beatriz.alves@caarapo.ms.gov.br",
    role: "entrevistador",
    ativo: false,
    criado_em: "2024-03-05T08:00:00Z",
  },
];
