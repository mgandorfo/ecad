-- Tabela de beneficiários do CadÚnico
CREATE TABLE public.beneficiarios (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  cpf           text        NOT NULL UNIQUE,
  logradouro    text        NOT NULL,
  numero        text        NOT NULL,
  complemento   text,
  bairro        text        NOT NULL,
  cidade        text        NOT NULL DEFAULT 'Caarapó',
  uf            char(2)     NOT NULL DEFAULT 'MS',
  cep           text,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX beneficiarios_cpf_idx  ON public.beneficiarios (cpf);
CREATE INDEX beneficiarios_nome_idx ON public.beneficiarios (nome);

ALTER TABLE public.beneficiarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beneficiarios_select" ON public.beneficiarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "beneficiarios_insert" ON public.beneficiarios FOR INSERT
  WITH CHECK (public.minha_role() IN ('admin', 'entrevistador', 'recepcionista'));

CREATE POLICY "beneficiarios_update" ON public.beneficiarios FOR UPDATE
  USING (public.minha_role() IN ('admin', 'entrevistador', 'recepcionista'));

CREATE POLICY "beneficiarios_delete" ON public.beneficiarios FOR DELETE
  USING (public.minha_role() = 'admin');

-- Função genérica para manter atualizado_em
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER beneficiarios_atualizado_em
  BEFORE UPDATE ON public.beneficiarios
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();
