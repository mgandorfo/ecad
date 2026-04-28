-- Migration M11: views e RPCs para analytics do dashboard e relatórios

-- ─── View: atendimentos com joins completos ───────────────────────────────────
-- Usada tanto pelo dashboard quanto pelo relatório; RLS da tabela base é herdada.

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
  -- servidor
  p.nome        AS servidor_nome
FROM public.atendimentos a
LEFT JOIN public.beneficiarios       b   ON b.id  = a.beneficiario_id
LEFT JOIN public.setores             se  ON se.id = a.setor_id
LEFT JOIN public.servicos            sv  ON sv.id = a.servico_id
LEFT JOIN public.status_atendimento  st  ON st.id = a.status_id
LEFT JOIN public.perfis              p   ON p.id  = a.servidor_id;

-- A view herda as políticas RLS da tabela atendimentos automaticamente,
-- pois é apenas um SELECT sobre ela — não é SECURITY DEFINER.

-- ─── RPC: kpis_dashboard ──────────────────────────────────────────────────────
-- Retorna métricas agregadas respeitando os filtros e a RLS do caller.

CREATE OR REPLACE FUNCTION public.kpis_dashboard(
  p_periodo    text    DEFAULT '7d',   -- '7d' | '30d' | 'mes'
  p_setor_id   uuid    DEFAULT NULL,
  p_servidor_id uuid   DEFAULT NULL
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
    SELECT a.*
    FROM public.atendimentos a
    CROSS JOIN periodo
    WHERE a.criado_em >= periodo.inicio
      AND (p_setor_id    IS NULL OR a.setor_id    = p_setor_id)
      AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
  )
  SELECT
    COUNT(*)                                                          AS total,
    COUNT(*) FILTER (WHERE concluido_em IS NULL)                     AS em_espera,
    COUNT(*) FILTER (WHERE concluido_em IS NOT NULL)                 AS concluidos,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM (concluido_em - criado_em)) / 60.0
      ) FILTER (WHERE concluido_em IS NOT NULL),
      0
    )                                                                 AS tempo_medio_minutos
  FROM base;
$$;

-- ─── RPC: atendimentos_por_dia ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.atendimentos_por_dia(
  p_periodo     text  DEFAULT '7d',
  p_setor_id    uuid  DEFAULT NULL,
  p_servidor_id uuid  DEFAULT NULL
)
RETURNS TABLE (
  dia   text,
  total bigint
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
  dias AS (
    SELECT generate_series(
      date_trunc('day', periodo.inicio),
      date_trunc('day', now()),
      interval '1 day'
    )::date AS dia
    FROM periodo
  ),
  contagem AS (
    SELECT date_trunc('day', a.criado_em)::date AS dia, COUNT(*) AS total
    FROM public.atendimentos a
    CROSS JOIN periodo
    WHERE a.criado_em >= periodo.inicio
      AND (p_setor_id    IS NULL OR a.setor_id    = p_setor_id)
      AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
    GROUP BY 1
  )
  SELECT
    to_char(d.dia, 'DD/MM') AS dia,
    COALESCE(c.total, 0)    AS total
  FROM dias d
  LEFT JOIN contagem c ON c.dia = d.dia
  ORDER BY d.dia;
$$;

-- ─── RPC: atendimentos_por_setor ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.atendimentos_por_setor(
  p_periodo     text  DEFAULT '7d',
  p_servidor_id uuid  DEFAULT NULL
)
RETURNS TABLE (
  setor text,
  total bigint
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
  )
  SELECT se.nome AS setor, COUNT(a.id) AS total
  FROM public.atendimentos a
  CROSS JOIN periodo
  JOIN public.setores se ON se.id = a.setor_id
  WHERE a.criado_em >= periodo.inicio
    AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
  GROUP BY se.nome
  ORDER BY total DESC;
$$;

-- ─── RPC: atendimentos_por_servico ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.atendimentos_por_servico(
  p_periodo     text  DEFAULT '7d',
  p_setor_id    uuid  DEFAULT NULL,
  p_servidor_id uuid  DEFAULT NULL
)
RETURNS TABLE (
  servico text,
  total   bigint
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
  )
  SELECT sv.nome AS servico, COUNT(a.id) AS total
  FROM public.atendimentos a
  CROSS JOIN periodo
  JOIN public.servicos sv ON sv.id = a.servico_id
  WHERE a.criado_em >= periodo.inicio
    AND (p_setor_id    IS NULL OR a.setor_id    = p_setor_id)
    AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
  GROUP BY sv.nome
  ORDER BY total DESC;
$$;

-- ─── RPC: atendimentos_por_status ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.atendimentos_por_status(
  p_periodo     text  DEFAULT '7d',
  p_setor_id    uuid  DEFAULT NULL,
  p_servidor_id uuid  DEFAULT NULL
)
RETURNS TABLE (
  status text,
  cor    text,
  total  bigint
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
  )
  SELECT st.nome AS status, st.cor, COUNT(a.id) AS total
  FROM public.atendimentos a
  CROSS JOIN periodo
  JOIN public.status_atendimento st ON st.id = a.status_id
  WHERE a.criado_em >= periodo.inicio
    AND (p_setor_id    IS NULL OR a.setor_id    = p_setor_id)
    AND (p_servidor_id IS NULL OR a.servidor_id = p_servidor_id)
  GROUP BY st.nome, st.cor
  ORDER BY total DESC;
$$;

-- ─── Grants: autenticados podem chamar as RPCs ────────────────────────────────
GRANT EXECUTE ON FUNCTION public.kpis_dashboard           TO authenticated;
GRANT EXECUTE ON FUNCTION public.atendimentos_por_dia     TO authenticated;
GRANT EXECUTE ON FUNCTION public.atendimentos_por_setor   TO authenticated;
GRANT EXECUTE ON FUNCTION public.atendimentos_por_servico TO authenticated;
GRANT EXECUTE ON FUNCTION public.atendimentos_por_status  TO authenticated;
