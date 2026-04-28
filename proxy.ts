import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rotas que não precisam de sessão
const PUBLIC_PATHS = ["/login", "/recuperar", "/redefinir", "/auth/callback"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === "/";

  // Sempre executa updateSession para manter o token fresco
  const response = await updateSession(request);

  // Se for rota pública, deixa passar (updateSession já tratou o refresh)
  if (isPublic) return response;

  // Para rotas protegidas, updateSession já redireciona para /login quando
  // não há sessão. Retornamos a resposta dele diretamente.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
