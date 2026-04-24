import { NextResponse, type NextRequest } from "next/server";

// Middleware stub — Supabase auth será integrado no Milestone 8.
// Sem variáveis de ambiente configuradas, passa todas as requisições.
export async function middleware(request: NextRequest) {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabase) {
    const { updateSession } = await import("@/lib/supabase/middleware");
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
