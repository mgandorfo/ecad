-- Tabela de auditoria para ações críticas do sistema.
-- Imutável: sem UPDATE nem DELETE via RLS. Inserção apenas por funções server-side.

CREATE TABLE public.audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,   -- ex: 'assumir_atendimento', 'concluir_atendimento', 'alterar_role'
  entity      text NOT NULL,   -- tabela afetada: 'atendimentos', 'perfis', etc.
  entity_id   text,            -- id do registro afetado (texto para flexibilidade)
  payload     jsonb,           -- dados relevantes (sem dados sensíveis)
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins e vigilância podem ler; ninguém pode escrever via RLS (apenas server-side)
CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT
  USING (
    (SELECT minha_role()) IN ('admin', 'vigilancia')
  );

-- Inserção bloqueada para todos via RLS — feita por service role no servidor
CREATE POLICY audit_log_insert ON public.audit_log
  FOR INSERT
  WITH CHECK (false);

-- Índices para consultas por usuário e por ação
CREATE INDEX audit_log_user_idx   ON public.audit_log (user_id);
CREATE INDEX audit_log_action_idx ON public.audit_log (action);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);

-- GRANT apenas leitura para authenticated (inserção pelo service role)
GRANT SELECT ON public.audit_log TO authenticated;
