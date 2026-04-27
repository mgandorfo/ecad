-- Tabela de setores
CREATE TABLE public.setores (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    text        NOT NULL UNIQUE,
  nome      text        NOT NULL,
  ativo     boolean     NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

-- Todos autenticados lêem setores
CREATE POLICY "setores: leitura autenticada"
  ON public.setores FOR SELECT
  TO authenticated
  USING (true);

-- Somente admin escreve
CREATE POLICY "setores: admin escreve"
  ON public.setores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Tabela de serviços (vinculada a setor)
CREATE TABLE public.servicos (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    text        NOT NULL UNIQUE,
  nome      text        NOT NULL,
  setor_id  uuid        NOT NULL REFERENCES public.setores (id) ON DELETE RESTRICT,
  ativo     boolean     NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicos: leitura autenticada"
  ON public.servicos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "servicos: admin escreve"
  ON public.servicos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
