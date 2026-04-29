import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Trata dois fluxos:
// 1. PKCE (reset de senha via /recuperar): chega com ?code=
// 2. Token hash (convite e magic link): chega com ?token_hash=&type=
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "invite" | "recovery" | "email" | null;
  const nextParam = searchParams.get("next") ?? "/dashboard";

  // Rejeita qualquer redirect que não seja caminho relativo (evita open redirect)
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  const supabase = await createClient();

  // Fluxo 1: PKCE (reset de senha)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fluxo 2: token_hash (convite de novo usuário)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      // Convite → manda para definir senha; outros tipos → destino padrão
      const destination = type === "invite" ? "/redefinir" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=callback`);
}
