-- Migration M8: corrige trigger, remove funções órfãs e aplica boas práticas
-- Execute no SQL Editor do Supabase Studio se o CLI não estiver configurado.

-- ─── 1. Remover funções obsoletas com referência a "profiles" (schema antigo) ────

DROP FUNCTION IF EXISTS public.can_see_all_atendimentos() CASCADE;
DROP FUNCTION IF EXISTS public.can_see_all_profiles()    CASCADE;
DROP FUNCTION IF EXISTS public.get_profiles_list()       CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()                CASCADE;
DROP FUNCTION IF EXISTS public.is_recepcionista()        CASCADE;

-- ─── 2. Recriar handle_new_user com search_path explícito ────────────────────
-- Sem SET search_path o trigger falha quando invocado pelo auth schema.

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
  ON CONFLICT (id) DO NOTHING;   -- idempotente: re-execução não quebra
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. Recriar minha_role com search_path explícito ─────────────────────────

CREATE OR REPLACE FUNCTION public.minha_role()
RETURNS public.role_usuario
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.perfis WHERE id = auth.uid();
$$;

-- ─── 4. Recriar set_atualizado_em com search_path ────────────────────────────

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

-- ─── 5. Função de onboarding: verifica se existe algum admin ──────────────────
-- Usada pelo Server Component para saber se deve exibir o fluxo de setup inicial.

CREATE OR REPLACE FUNCTION public.tem_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.perfis WHERE role = 'admin' AND ativo = true);
$$;

-- ─── 6. Índice parcial para buscas de fila ativo sem servidor ─────────────────
-- Melhora performance da query de fila de espera (prioritario + sem servidor + concluido_em null)

CREATE INDEX IF NOT EXISTS atendimentos_fila_aberta_idx
  ON public.atendimentos (prioritario DESC, criado_em ASC)
  WHERE servidor_id IS NULL AND concluido_em IS NULL;

-- ─── 7. Índice GIN para busca textual em beneficiários ────────────────────────
-- Permite busca rápida por nome sem full table scan em tabelas grandes.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS beneficiarios_nome_trgm_idx
  ON public.beneficiarios USING GIN (nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS beneficiarios_cpf_trgm_idx
  ON public.beneficiarios USING GIN (cpf gin_trgm_ops);

-- ─── 8. Constraint: CPF deve ter apenas dígitos (11 chars sem máscara) ────────

ALTER TABLE public.beneficiarios
  DROP CONSTRAINT IF EXISTS beneficiarios_cpf_formato;

ALTER TABLE public.beneficiarios
  ADD CONSTRAINT beneficiarios_cpf_formato
  CHECK (cpf ~ '^[0-9]{11}$');

-- ─── 9. Constraint: cor do status deve ser hex válido ─────────────────────────

ALTER TABLE public.status_atendimento
  DROP CONSTRAINT IF EXISTS status_cor_hex;

ALTER TABLE public.status_atendimento
  ADD CONSTRAINT status_cor_hex
  CHECK (cor ~ '^#[0-9a-fA-F]{6}$');

-- ─── 10. Constraint: assumido_em deve ser depois de criado_em ─────────────────

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

-- ─── 11. RPC pública: primeiro_admin_pendente ─────────────────────────────────
-- Retorna true quando o sistema não tem nenhum admin ainda (usado no onboarding).
-- Exposta via PostgREST para ser chamada sem autenticação no fluxo de setup.

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
