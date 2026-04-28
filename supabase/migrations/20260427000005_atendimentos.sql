-- Tabela principal: atendimentos
CREATE TABLE public.atendimentos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id uuid        NOT NULL REFERENCES public.beneficiarios (id)     ON DELETE RESTRICT,
  setor_id        uuid        NOT NULL REFERENCES public.setores (id)           ON DELETE RESTRICT,
  servico_id      uuid        NOT NULL REFERENCES public.servicos (id)          ON DELETE RESTRICT,
  status_id       uuid        NOT NULL REFERENCES public.status_atendimento (id) ON DELETE RESTRICT,
  servidor_id     uuid        REFERENCES public.perfis (id)                     ON DELETE SET NULL,
  criado_por      uuid        NOT NULL REFERENCES public.perfis (id)            ON DELETE RESTRICT,
  prioritario     boolean     NOT NULL DEFAULT false,
  anotacoes       text,
  criado_em       timestamptz NOT NULL DEFAULT now(),
  atualizado_em   timestamptz NOT NULL DEFAULT now(),
  assumido_em     timestamptz,
  concluido_em    timestamptz
);

CREATE INDEX atendimentos_status_idx     ON public.atendimentos (status_id);
CREATE INDEX atendimentos_servidor_idx   ON public.atendimentos (servidor_id);
CREATE INDEX atendimentos_criado_por_idx ON public.atendimentos (criado_por);
CREATE INDEX atendimentos_setor_idx      ON public.atendimentos (setor_id);
CREATE INDEX atendimentos_criado_em_idx  ON public.atendimentos (criado_em DESC);
CREATE INDEX atendimentos_fila_idx       ON public.atendimentos (prioritario DESC, criado_em ASC);

CREATE TRIGGER atendimentos_atualizado_em
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Admin e vigilância: vêem todos
CREATE POLICY "atendimentos_select_admin_vigilancia" ON public.atendimentos FOR SELECT
  USING (public.minha_role() IN ('admin', 'vigilancia'));

-- Entrevistador: vê fila livre (sem servidor) + os seus
CREATE POLICY "atendimentos_select_entrevistador" ON public.atendimentos FOR SELECT
  USING (
    public.minha_role() = 'entrevistador'
    AND (servidor_id IS NULL OR servidor_id = auth.uid())
  );

-- Recepcionista: vê os que ele abriu
CREATE POLICY "atendimentos_select_recepcionista" ON public.atendimentos FOR SELECT
  USING (
    public.minha_role() = 'recepcionista'
    AND criado_por = auth.uid()
  );

-- Inserção: admin, entrevistador e recepcionista; criado_por deve ser o próprio usuário
CREATE POLICY "atendimentos_insert" ON public.atendimentos FOR INSERT
  WITH CHECK (
    public.minha_role() IN ('admin', 'entrevistador', 'recepcionista')
    AND criado_por = auth.uid()
  );

-- Update admin: atualiza qualquer atendimento
CREATE POLICY "atendimentos_update_admin" ON public.atendimentos FOR UPDATE
  USING (public.minha_role() = 'admin');

-- Update entrevistador: assume (fila livre) ou atualiza os seus
CREATE POLICY "atendimentos_update_entrevistador" ON public.atendimentos FOR UPDATE
  USING (
    public.minha_role() = 'entrevistador'
    AND (servidor_id IS NULL OR servidor_id = auth.uid())
  )
  WITH CHECK (servidor_id = auth.uid());

-- Delete: somente admin
CREATE POLICY "atendimentos_delete" ON public.atendimentos FOR DELETE
  USING (public.minha_role() = 'admin');
