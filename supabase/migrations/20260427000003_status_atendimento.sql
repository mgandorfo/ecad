-- Tabela de status configuráveis de atendimento
CREATE TABLE public.status_atendimento (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      text        NOT NULL UNIQUE,
  cor       text        NOT NULL DEFAULT '#6b7280',
  ordem     int         NOT NULL DEFAULT 0,
  ativo     boolean     NOT NULL DEFAULT true
);

ALTER TABLE public.status_atendimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_select" ON public.status_atendimento FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "status_admin" ON public.status_atendimento FOR ALL
  USING (public.minha_role() = 'admin');
