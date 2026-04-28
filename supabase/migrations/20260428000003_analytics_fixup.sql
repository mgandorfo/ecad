-- Migration M11-fixup: correções pós-review do analytics
-- 1. view_atendimentos: adicionar servidor_role e servidor_email
-- 2. GRANT SELECT na view para authenticated
-- 3. kpis_dashboard: corrigir em_espera baseado em status, não em concluido_em

-- ─── 1. Recriar view com campos adicionais do servidor ───────────────────────

CREATE OR REPLACE VIEW public.view_atendimentos AS
SELECT
  a.id,
  a.beneficiario_id,
  a.setor_id,
  a.servico_id,
  a.status_id,
  a.servidor_id,
  a.criado_por,
  a.prioritario,
  a.anotacoes,
  a.criado_em,
  a.atualizado_em,
  a.assumido_em,
  a.concluido_em,
  -- beneficiário
  b.nome        AS beneficiario_nome,
  b.cpf         AS beneficiario_cpf,
  -- setor
  se.nome       AS setor_nome,
  se.codigo     AS setor_codigo,
  -- serviço
  sv.nome       AS servico_nome,
  sv.codigo     AS servico_codigo,
  -- status
  st.nome       AS status_nome,
  st.cor        AS status_cor,
  st.ordem      AS status_ordem,
  -- servidor (campos completos para evitar hardcode de role)
  p.nome        AS servidor_nome,
  p.role        AS servidor_role,
  p.email       AS servidor_email
FROM public.atendimentos a
LEFT JOIN public.beneficiarios       b   ON b.id  = a.beneficiario_id
LEFT JOIN public.setores             se  ON se.id = a.setor_id
LEFT JOIN public.servicos            sv  ON sv.id = a.servico_id
LEFT JOIN public.status_atendimento  st  ON st.id = a.status_id
LEFT JOIN public.perfis              p   ON p.id  = a.servidor_id;

-- ─── 2. GRANT SELECT na view para authenticated ───────────────────────────────
-- Views não herdam grants da tabela base automaticamente; grant explícito é necessário.

GRANT SELECT ON public.view_atendimentos TO authenticated;

-- ─── 3. Corrigir RPC kpis_dashboard: em_espera via nome de status ─────────────
-- Lógica anterior: concluido_em IS NULL (incorreto — inclui atendimentos em andamento)
-- Lógica correta: status cujo nome começa com "aguardando" ou "em espera"
-- Isso respeita que o status é configurável pelo admin.

CREATE OR REPLACE FUNCTION public.kpis_dashboard(
  p_periodo     text  DEFAULT '7d',
  p_setor_id    uuid  DEFAULT NULL,
  p_servidor_id uuid  DEFAULT NULL
)
RETURNS TABLE (
  total              bigint,
  em_espera          bigint,
  concluidos         bigint,
  tempo_medio_minutos numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH periodo AS (
    SELECT
      CASE p_periodo
        WHEN '7d'  THEN now() - interval '6 days'
        WHEN '30d' THEN now() - interval '29 days'
        WHEN 'mes' THEN date_trunc('month', now())
        ELSE            now() - interval '6 days'
      END AS inicio
  ),
  base AS (
    SELECT a.*, st.nome AS status_nome
    FROM public.atendimentos a
    JOIN public.status_atendimento st ON st.id = a.status_id
    CROSS JOIN periodo
    WHERE a.criado_em >= periodo.inicio
      AND (p_setor_id    IS NULL OR a.setor_id    = p_setor_id)
      AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
  )
  SELECT
    COUNT(*)                                                              AS total,
    -- Em espera: status cujo nome indica fila (aguardando atendimento)
    COUNT(*) FILTER (
      WHERE status_nome ILIKE 'aguardando%'
         OR status_nome ILIKE 'em espera%'
         OR status_nome ILIKE 'na fila%'
    )                                                                     AS em_espera,
    COUNT(*) FILTER (WHERE concluido_em IS NOT NULL)                      AS concluidos,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (concluido_em - criado_em)) / 60.0
      ) FILTER (WHERE concluido_em IS NOT NULL),
      0
    )                                                                     AS tempo_medio_minutos
  FROM base;
$$;
