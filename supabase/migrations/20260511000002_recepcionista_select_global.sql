-- M13: libera SELECT global na tabela atendimentos para recepcionista.
-- Antes: recepcionista só via registros que ele próprio criou (criado_por = auth.uid()).
-- Agora: recepcionista pode ver todos os atendimentos para acessar dashboard e relatórios.
-- INSERT/UPDATE/DELETE permanecem restritos conforme políticas existentes.
DROP POLICY IF EXISTS "atendimentos_select_recepcionista" ON public.atendimentos;

CREATE POLICY "atendimentos_select_recepcionista" ON public.atendimentos FOR SELECT
  USING ((SELECT public.minha_role()) = 'recepcionista');
