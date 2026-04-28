-- Extensão para busca sem acento
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Enum de perfis de acesso
CREATE TYPE public.role_usuario AS ENUM (
  'admin',
  'entrevistador',
  'recepcionista',
  'vigilancia'
);

-- Tabela de perfis: espelha auth.users com role e dados extras
CREATE TABLE public.perfis (
  id        uuid              PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome      text              NOT NULL,
  email     text              NOT NULL UNIQUE,
  role      public.role_usuario NOT NULL DEFAULT 'recepcionista',
  ativo     boolean           NOT NULL DEFAULT true,
  criado_em timestamptz       NOT NULL DEFAULT now()
);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Helper: role do usuário logado (evita subquery em cada política RLS)
CREATE OR REPLACE FUNCTION public.minha_role()
RETURNS public.role_usuario
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid();
$$;

-- Perfis: cada um vê o próprio; admin vê todos
CREATE POLICY "perfis_select" ON public.perfis FOR SELECT
  USING (id = auth.uid() OR public.minha_role() = 'admin');

-- Usuário atualiza o próprio perfil
CREATE POLICY "perfis_update_proprio" ON public.perfis FOR UPDATE
  USING (id = auth.uid());

-- Admin atualiza qualquer perfil
CREATE POLICY "perfis_update_admin" ON public.perfis FOR UPDATE
  USING (public.minha_role() = 'admin');

-- Trigger: cria perfil automaticamente ao registrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
