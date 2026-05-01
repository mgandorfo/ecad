"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Redireciona para /redefinir preservando o hash fragment com o token de convite.
// O hash não pode ser lido server-side — a substituição precisa ser feita no cliente.
export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      router.replace(`/redefinir${hash}`);
    } else {
      router.replace("/redefinir");
    }
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
