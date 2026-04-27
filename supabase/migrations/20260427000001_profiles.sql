-- Enum de perfis de acesso
CREATE TYPE public.role AS ENUM (
  'admin',
  'entrevistador',
  'recepcionista',
  'vigilancia'
);

-- Tabela de perfis: espelha auth.users com role e dados extras
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome       text        NOT NULL,
  email      text        NOT NULL,
  role       public.role NOT NULL DEFAULT 'recepcionista',
  ativo      boolean     NOT NULL DEFAULT true,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado lê qualquer perfil (exibir nomes na fila, etc.)
CREATE POLICY "profiles: leitura autenticada"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Usuário edita apenas o próprio perfil (nome)
CREATE POLICY "profiles: atualizar próprio"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Somente admin gerencia perfis alheios
CREATE POLICY "profiles: admin gerencia todos"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger: cria profile automaticamente ao registrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.role, 'recepcionista')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
