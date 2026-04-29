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

    supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        router.replace("/redefinir");
      }
    });

    // Dispara a leitura do hash — o SDK detecta o token automaticamente
    supabase.auth.getSession();
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
