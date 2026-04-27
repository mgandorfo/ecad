"use client";

import { useRole } from "@/lib/role-context";
import type { Atendimento, Setor, Perfil } from "@/lib/types";
import { DashboardClient } from "./dashboard-client";

// ID mockado do usuário logado (Entrevistador)
const SERVIDOR_ATUAL_ID = "u2";

interface DashboardWrapperProps {
  atendimentos: Atendimento[];
  setores: Setor[];
  servidores: Perfil[];
}

export function DashboardWrapper({ atendimentos, setores, servidores }: DashboardWrapperProps) {
  const role = useRole();
  return (
    <DashboardClient
      atendimentos={atendimentos}
      setores={setores}
      servidores={servidores}
      role={role}
      servidorAtualId={SERVIDOR_ATUAL_ID}
    />
  );
}
