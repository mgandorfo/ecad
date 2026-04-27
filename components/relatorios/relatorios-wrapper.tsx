"use client";

import { useRole } from "@/lib/role-context";
import type { Atendimento, Setor, Servico, StatusAtendimento, Perfil } from "@/lib/types";
import { RelatoriosClient } from "./relatorios-client";

const SERVIDOR_ATUAL_ID = "u2";

interface RelatoriosWrapperProps {
  atendimentos: Atendimento[];
  setores: Setor[];
  servicos: Servico[];
  statusList: StatusAtendimento[];
  servidores: Perfil[];
}

export function RelatoriosWrapper(props: RelatoriosWrapperProps) {
  const role = useRole();
  return (
    <RelatoriosClient
      {...props}
      role={role}
      servidorAtualId={SERVIDOR_ATUAL_ID}
    />
  );
}
