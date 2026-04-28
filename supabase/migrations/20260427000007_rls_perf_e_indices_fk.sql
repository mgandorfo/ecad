-- Migration M8: otimizações RLS + índices FK ausentes
-- Ref: supabase-postgres-best-practices §3.3, §1.1, §4.2

-- ─── 1. Wrap (SELECT ...) nas políticas RLS para avaliar minha_role() uma vez por query ──
--
-- Sem o wrapper, PostgreSQL invoca minha_role() para cada linha retornada,
-- resultando em N lookups na tabela perfis para uma query que retorna N linhas.
-- Com (SELECT ...), o planner avalia a função uma única vez e reutiliza o valor.

-- perfis ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "perfis_select"          ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_proprio"  ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_admin"    ON public.perfis;

CREATE POLICY "perfis_select" ON public.perfis FOR SELECT
  USING (id = (SELECT auth.uid()) OR (SELECT public.minha_role()) = 'admin');

CREATE POLICY "perfis_update_proprio" ON public.perfis FOR UPDATE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "perfis_update_admin" ON public.perfis FOR UPDATE
  USING ((SELECT public.minha_role()) = 'admin');

-- setores ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "setores_select" ON public.setores;
DROP POLICY IF EXISTS "setores_admin"  ON public.setores;

CREATE POLICY "setores_select" ON public.setores FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "setores_admin" ON public.setores FOR ALL
  USING ((SELECT public.minha_role()) = 'admin');

-- servicos ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "servicos_select" ON public.servicos;
DROP POLICY IF EXISTS "servicos_admin"  ON public.servicos;

CREATE POLICY "servicos_select" ON public.servicos FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "servicos_admin" ON public.servicos FOR ALL
  USING ((SELECT public.minha_role()) = 'admin');

-- status_atendimento ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "status_select" ON public.status_atendimento;
DROP POLICY IF EXISTS "status_admin"  ON public.status_atendimento;

CREATE POLICY "status_select" ON public.status_atendimento FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "status_admin" ON public.status_atendimento FOR ALL
  USING ((SELECT public.minha_role()) = 'admin');

-- beneficiarios ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "beneficiarios_select" ON public.beneficiarios;
DROP POLICY IF EXISTS "beneficiarios_insert" ON public.beneficiarios;
DROP POLICY IF EXISTS "beneficiarios_update" ON public.beneficiarios;
DROP POLICY IF EXISTS "beneficiarios_delete" ON public.beneficiarios;

CREATE POLICY "beneficiarios_select" ON public.beneficiarios FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "beneficiarios_insert" ON public.beneficiarios FOR INSERT
  WITH CHECK ((SELECT public.minha_role()) IN ('admin', 'entrevistador', 'recepcionista'));

CREATE POLICY "beneficiarios_update" ON public.beneficiarios FOR UPDATE
  USING ((SELECT public.minha_role()) IN ('admin', 'entrevistador', 'recepcionista'));

CREATE POLICY "beneficiarios_delete" ON public.beneficiarios FOR DELETE
  USING ((SELECT public.minha_role()) = 'admin');

-- atendimentos ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "atendimentos_select_admin_vigilancia"   ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_select_entrevistador"      ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_select_recepcionista"      ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_insert"                    ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_update_admin"              ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_update_entrevistador"      ON public.atendimentos;
DROP POLICY IF EXISTS "atendimentos_delete"                    ON public.atendimentos;

CREATE POLICY "atendimentos_select_admin_vigilancia" ON public.atendimentos FOR SELECT
  USING ((SELECT public.minha_role()) IN ('admin', 'vigilancia'));

CREATE POLICY "atendimentos_select_entrevistador" ON public.atendimentos FOR SELECT
  USING (
    (SELECT public.minha_role()) = 'entrevistador'
    AND (servidor_id IS NULL OR servidor_id = (SELECT auth.uid()))
  );

CREATE POLICY "atendimentos_select_recepcionista" ON public.atendimentos FOR SELECT
  USING (
    (SELECT public.minha_role()) = 'recepcionista'
    AND criado_por = (SELECT auth.uid())
  );

CREATE POLICY "atendimentos_insert" ON public.atendimentos FOR INSERT
  WITH CHECK (
    (SELECT public.minha_role()) IN ('admin', 'entrevistador', 'recepcionista')
    AND criado_por = (SELECT auth.uid())
  );

CREATE POLICY "atendimentos_update_admin" ON public.atendimentos FOR UPDATE
  USING ((SELECT public.minha_role()) = 'admin');

CREATE POLICY "atendimentos_update_entrevistador" ON public.atendimentos FOR UPDATE
  USING (
    (SELECT public.minha_role()) = 'entrevistador'
    AND (servidor_id IS NULL OR servidor_id = (SELECT auth.uid()))
  )
  WITH CHECK (servidor_id = (SELECT auth.uid()));

CREATE POLICY "atendimentos_delete" ON public.atendimentos FOR DELETE
  USING ((SELECT public.minha_role()) = 'admin');

-- ─── 2. Índice em perfis.role (acelera primeiro_admin_pendente e futuras queries) ──

CREATE INDEX IF NOT EXISTS perfis_role_idx ON public.perfis (role);

-- ─── 3. Índice explícito na FK servicos.setor_id (Postgres não cria automaticamente) ──

CREATE INDEX IF NOT EXISTS servicos_setor_id_idx ON public.servicos (setor_id);
