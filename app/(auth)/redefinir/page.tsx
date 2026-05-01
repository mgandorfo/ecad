"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ senha?: string; confirmacao?: string }>({});

  useEffect(() => {
    const supabase = createClient();

    // Aguarda o SDK processar o hash fragment ou confirmar sessão já existente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setReady(true);
      } else {
        setError("Sessão inválida ou expirada. Solicite um novo convite.");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const senha = form.get("senha") as string;
    const confirmacao = form.get("confirmacao") as string;

    if (senha.length < 8) {
      setFieldErrors({ senha: "Mínimo 8 caracteres" });
      return;
    }
    if (senha !== confirmacao) {
      setFieldErrors({ confirmacao: "As senhas não coincidem" });
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setPending(false);

    if (error) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado.");
      return;
    }

    router.replace("/login?redefinido=1");
  }

  if (!ready && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Verificando acesso…</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Nova senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={!ready}
              required
            />
            {fieldErrors.senha && (
              <p className="text-xs text-destructive">{fieldErrors.senha}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmacao">Confirmar senha</Label>
            <Input
              id="confirmacao"
              name="confirmacao"
              type="password"
              placeholder="Repita a senha"
              autoComplete="new-password"
              disabled={!ready}
              required
            />
            {fieldErrors.confirmacao && (
              <p className="text-xs text-destructive">{fieldErrors.confirmacao}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button className="w-full mt-1" type="submit" disabled={pending || !ready}>
            {pending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
