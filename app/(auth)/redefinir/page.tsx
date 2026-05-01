"use client";

import { useState } from "react";
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ senha?: string; confirmacao?: string }>({});

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
              required
            />
            {fieldErrors.confirmacao && (
              <p className="text-xs text-destructive">{fieldErrors.confirmacao}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button className="w-full mt-1" type="submit" disabled={pending}>
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
