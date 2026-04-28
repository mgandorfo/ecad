-- Revoga o grant de anon na função primeiro_admin_pendente.
-- A função só é chamada após signInWithPassword (sessão autenticada),
-- portanto o grant a anon é desnecessário e aumenta a superfície de ataque
-- (permite descobrir se o sistema está sem admin sem autenticar).
REVOKE EXECUTE ON FUNCTION public.primeiro_admin_pendente() FROM anon;
GRANT  EXECUTE ON FUNCTION public.primeiro_admin_pendente() TO authenticated;
