import { createAdminClient } from "./admin";

export type AuditAction =
  | "assumir_atendimento"
  | "concluir_atendimento"
  | "trocar_entrevistador"
  | "alterar_role_usuario"
  | "excluir_usuario"
  | "criar_usuario";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}

export async function registrarAuditoria(entry: AuditEntry): Promise<void> {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("audit_log").insert({
    user_id: entry.userId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    payload: entry.payload ?? null,
  });

  if (error) {
    console.error("[audit] falha ao registrar auditoria:", error.message);
  }
}
