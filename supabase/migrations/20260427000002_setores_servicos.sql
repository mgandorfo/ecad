-- Tabela de setores
CREATE TABLE public.setores (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    text        NOT NULL UNIQUE,
  nome      text        NOT NULL,
  ativo     boolean     NOT NULL DEFAULT true
);

ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "setores_select" ON public.setores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "setores_admin" ON public.setores FOR ALL
  USING (public.minha_role() = 'admin');

-- Tabela de serviços (vinculada a setor)
CREATE TABLE public.servicos (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    text        NOT NULL UNIQUE,
  nome      text        NOT NULL,
  setor_id  uuid        NOT NULL REFERENCES public.setores (id) ON DELETE RESTRICT,
  ativo     boolean     NOT NULL DEFAULT true
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicos_select" ON public.servicos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "servicos_admin" ON public.servicos FOR ALL
  USING (public.minha_role() = 'admin');
