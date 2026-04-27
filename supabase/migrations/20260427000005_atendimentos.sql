-- Tabela principal: atendimentos
CREATE TABLE public.atendimentos (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id uuid       NOT NULL REFERENCES public.beneficiarios (id) ON DELETE RESTRICT,
  setor_id        uuid       NOT NULL REFERENCES public.setores (id)        ON DELETE RESTRICT,
  servico_id      uuid       NOT NULL REFERENCES public.servicos (id)       ON DELETE RESTRICT,
  status_id       uuid       NOT NULL REFERENCES public.status_atendimento (id) ON DELETE RESTRICT,
  -- servidor que assumiu o atendimento (null = na fila)
  servidor_id     uuid       REFERENCES public.profiles (id) ON DELETE SET NULL,
  prioritario     boolean    NOT NULL DEFAULT false,
  anotacoes       text,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now(),
  assumido_em     timestamptz,
  concluido_em    timestamptz
);

CREATE INDEX atendimentos_status_idx      ON public.atendimentos (status_id);
CREATE INDEX atendimentos_servidor_idx    ON public.atendimentos (servidor_id);
CREATE INDEX atendimentos_setor_idx       ON public.atendimentos (setor_id);
CREATE INDEX atendimentos_criado_em_idx   ON public.atendimentos (criado_em DESC);
-- Índice composto para a query da fila (prioritário desc, criado_em asc)
CREATE INDEX atendimentos_fila_idx        ON public.atendimentos (prioritario DESC, criado_em ASC);

CREATE TRIGGER atendimentos_updated_at
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- ── SELECT ────────────────────────────────────────────────────────────────────
-- Admin e vigilância: vêem todos os atendimentos
CREATE POLICY "atendimentos: admin e vigilancia lêem tudo"
  ON public.atendimentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vigilancia')
    )
  );

-- Entrevistador: vê a fila completa (fila = sem servidor) + seus próprios
CREATE POLICY "atendimentos: entrevistador lê fila e seus"
  ON public.atendimentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'entrevistador'
    )
    AND (servidor_id IS NULL OR servidor_id = auth.uid())
  );

-- Recepcionista: vê apenas os atendimentos que ele criou
-- (usamos criado_por para rastrear; adicionamos a coluna abaixo)
CREATE POLICY "atendimentos: recepcionista lê os seus"
  ON public.atendimentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'recepcionista'
    )
    AND criado_por = auth.uid()
  );

-- ── INSERT ────────────────────────────────────────────────────────────────────
-- Admin, entrevistador e recepcionista podem criar atendimentos
CREATE POLICY "atendimentos: inserir"
  ON public.atendimentos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'entrevistador', 'recepcionista')
    )
    AND criado_por = auth.uid()
  );

-- ── UPDATE ────────────────────────────────────────────────────────────────────
-- Admin atualiza qualquer atendimento
CREATE POLICY "atendimentos: admin atualiza tudo"
  ON public.atendimentos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (true);

-- Entrevistador atualiza atendimentos que ainda estão na fila (assumir)
-- ou que já são seus
CREATE POLICY "atendimentos: entrevistador atualiza fila e seus"
  ON public.atendimentos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'entrevistador'
    )
    AND (servidor_id IS NULL OR servidor_id = auth.uid())
  )
  WITH CHECK (
    -- Ao assumir, deve setar servidor_id para si mesmo
    servidor_id = auth.uid()
  );

-- ── DELETE ────────────────────────────────────────────────────────────────────
-- Somente admin exclui
CREATE POLICY "atendimentos: admin exclui"
  ON public.atendimentos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Adiciona coluna criado_por (quem abriu o atendimento) — referencia profiles
ALTER TABLE public.atendimentos
  ADD COLUMN criado_por uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT;

CREATE INDEX atendimentos_criado_por_idx ON public.atendimentos (criado_por);
