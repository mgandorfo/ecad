import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que não exigem sessão
const PUBLIC_PATHS = ["/login", "/recuperar", "/redefinir", "/auth/callback", "/auth/confirm"];
// Rotas que exigem sessão mas não redirecionam usuário logado para /dashboard
const AUTH_ONLY_PATHS = ["/onboarding"];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: nunca executar código entre createServerClient e getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = matchesPath(pathname, PUBLIC_PATHS) || pathname === "/";
  const isAuthOnly = matchesPath(pathname, AUTH_ONLY_PATHS);

  // Sem sessão em rota protegida → /login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Com sessão tentando acessar /login → /dashboard
  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Com sessão em /onboarding: verifica se onboarding ainda é necessário
  if (user && isAuthOnly) {
    const { data: pendente, error } = await supabase.rpc("primeiro_admin_pendente");
    if (!error && !pendente) {
      // Onboarding concluído — redireciona para o app
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
