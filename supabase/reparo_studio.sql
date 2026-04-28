-- ============================================================
-- REPARO E-CAD — cole e execute no Supabase Studio > SQL Editor
-- ============================================================
-- Corrige o trigger handle_new_user (causa do erro 500 no registro)
-- e remove funções obsoletas que referenciam "profiles" (schema antigo).
-- ============================================================

-- 1. Remover funções obsoletas (referenciam tabela "profiles" que não existe)
DROP FUNCTION IF EXISTS public.can_see_all_atendimentos() CASCADE;
DROP FUNCTION IF EXISTS public.can_see_all_profiles()    CASCADE;
DROP FUNCTION IF EXISTS public.get_profiles_list()       CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()                CASCADE;
DROP FUNCTION IF EXISTS public.is_recepcionista()        CASCADE;

-- 2. Recriar trigger de criação automática de perfil
--    A causa do erro 500 era a ausência de SET search_path = public
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Recriar minha_role com search_path
CREATE OR REPLACE FUNCTION public.minha_role()
RETURNS public.role_usuario
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid();
$$;

-- 4. Recriar set_atualizado_em com search_path
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- 5. Função para verificar se o sistema já tem admin (usada no onboarding)
CREATE OR REPLACE FUNCTION public.primeiro_admin_pendente()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.perfis WHERE role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.primeiro_admin_pendente() TO anon, authenticated;

-- 6. Melhorias de índice para fila de atendimento
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS atendimentos_fila_aberta_idx
  ON public.atendimentos (prioritario DESC, criado_em ASC)
  WHERE servidor_id IS NULL AND concluido_em IS NULL;

CREATE INDEX IF NOT EXISTS beneficiarios_nome_trgm_idx
  ON public.beneficiarios USING GIN (nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS beneficiarios_cpf_trgm_idx
  ON public.beneficiarios USING GIN (cpf gin_trgm_ops);

-- 7. Constraints de integridade de dados
ALTER TABLE public.beneficiarios
  DROP CONSTRAINT IF EXISTS beneficiarios_cpf_formato;
ALTER TABLE public.beneficiarios
  ADD CONSTRAINT beneficiarios_cpf_formato
  CHECK (cpf ~ '^[0-9]{11}$');

ALTER TABLE public.status_atendimento
  DROP CONSTRAINT IF EXISTS status_cor_hex;
ALTER TABLE public.status_atendimento
  ADD CONSTRAINT status_cor_hex
  CHECK (cor ~ '^#[0-9a-fA-F]{6}$');

ALTER TABLE public.atendimentos
  DROP CONSTRAINT IF EXISTS atendimentos_assumido_apos_criado;
ALTER TABLE public.atendimentos
  ADD CONSTRAINT atendimentos_assumido_apos_criado
  CHECK (assumido_em IS NULL OR assumido_em >= criado_em);

ALTER TABLE public.atendimentos
  DROP CONSTRAINT IF EXISTS atendimentos_concluido_apos_assumido;
ALTER TABLE public.atendimentos
  ADD CONSTRAINT atendimentos_concluido_apos_assumido
  CHECK (concluido_em IS NULL OR assumido_em IS NOT NULL);

-- ============================================================
-- VERIFICAÇÃO — execute após o bloco acima e confirme os resultados:
-- ============================================================
SELECT 'trigger' as tipo, tgname as nome, tgenabled::text
  FROM pg_trigger
 WHERE tgname = 'on_auth_user_created'
UNION ALL
SELECT 'function', proname, 'ok'
  FROM pg_proc
 WHERE proname IN ('handle_new_user', 'minha_role', 'primeiro_admin_pendente');
