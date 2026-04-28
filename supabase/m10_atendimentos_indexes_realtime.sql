-- ============================================================
-- M10 — Índices de performance para fila + habilitar Realtime
-- Execute no Supabase Studio > SQL Editor
-- ============================================================

-- Índice simples para lookup por status (fila e filtros)
CREATE INDEX IF NOT EXISTS idx_atendimentos_status_id
  ON public.atendimentos (status_id);

-- Índice simples para lookup por servidor (meus atendimentos)
CREATE INDEX IF NOT EXISTS idx_atendimentos_servidor_id
  ON public.atendimentos (servidor_id);

-- Índice para atendimentos abertos (predicate index — só não concluídos)
CREATE INDEX IF NOT EXISTS idx_atendimentos_abertos
  ON public.atendimentos (concluido_em)
  WHERE concluido_em IS NULL;

-- Índice composto para ordenação da fila:
-- inclui status_id para que o planner use este índice na query principal de getFilaAtendimentos
-- (filtra status_id, ordena por prioritario DESC, criado_em ASC, apenas não concluídos)
CREATE INDEX IF NOT EXISTS idx_atendimentos_fila
  ON public.atendimentos (status_id, prioritario DESC, criado_em ASC)
  WHERE concluido_em IS NULL;

-- Índice para busca de atendimentos por quem criou
CREATE INDEX IF NOT EXISTS idx_atendimentos_criado_por
  ON public.atendimentos (criado_por);

-- ── Habilitar Realtime na tabela atendimentos ──────────────────────────────
-- REPLICA IDENTITY FULL: envia linha completa (old + new) nos eventos UPDATE/DELETE,
-- necessário para filtros por payload no canal e para futura atualização otimista.
ALTER TABLE public.atendimentos REPLICA IDENTITY FULL;

-- Adiciona a tabela à publication do Supabase Realtime (padrão do projeto).
-- Se já existir na publication, esta instrução é idempotente no Supabase.
ALTER PUBLICATION supabase_realtime ADD TABLE public.atendimentos;
