"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

// Trata o fluxo de convite do Supabase que chega via hash fragment:
// /auth/confirm#access_token=...&refresh_token=...&type=invite
// O hash só é acessível no cliente — não pode ser lido em route handlers server-side.
export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Listener para eventos futuros (caso o SDK ainda não tenha processado o hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        router.replace("/redefinir");
      }
    });

    // Verifica sessão já existente (caso o SDK já tenha processado o hash antes do listener)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/redefinir");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Verificando acesso…</p>
      </div>
    </div>
  );
}
