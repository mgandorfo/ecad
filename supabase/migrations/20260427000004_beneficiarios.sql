-- Tabela de beneficiários do CadÚnico
CREATE TABLE public.beneficiarios (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text        NOT NULL,
  cpf          text        NOT NULL UNIQUE,
  logradouro   text        NOT NULL,
  numero       text        NOT NULL,
  complemento  text,
  bairro       text        NOT NULL,
  cidade       text        NOT NULL,
  uf           char(2)     NOT NULL,
  cep          text,
  criado_em    timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX beneficiarios_cpf_idx  ON public.beneficiarios (cpf);
CREATE INDEX beneficiarios_nome_idx ON public.beneficiarios (nome);

ALTER TABLE public.beneficiarios ENABLE ROW LEVEL SECURITY;

-- Admin, entrevistador e recepcionista lêem e escrevem beneficiários
CREATE POLICY "beneficiarios: leitura"
  ON public.beneficiarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'entrevistador', 'recepcionista')
    )
  );

CREATE POLICY "beneficiarios: inserir"
  ON public.beneficiarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'entrevistador', 'recepcionista')
    )
  );

CREATE POLICY "beneficiarios: atualizar"
  ON public.beneficiarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'entrevistador', 'recepcionista')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'entrevistador', 'recepcionista')
    )
  );

-- Somente admin exclui
CREATE POLICY "beneficiarios: excluir admin"
  ON public.beneficiarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para manter atualizado_em sincronizado
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER beneficiarios_updated_at
  BEFORE UPDATE ON public.beneficiarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
