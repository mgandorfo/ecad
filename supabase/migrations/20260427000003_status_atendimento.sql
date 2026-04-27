-- Tabela de status configuráveis de atendimento
CREATE TABLE public.status_atendimento (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      text        NOT NULL,
  cor       text        NOT NULL DEFAULT '#6b7280',
  ordem     integer     NOT NULL DEFAULT 0,
  ativo     boolean     NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.status_atendimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status: leitura autenticada"
  ON public.status_atendimento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "status: admin escreve"
  ON public.status_atendimento FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
