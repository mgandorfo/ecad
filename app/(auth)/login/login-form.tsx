"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
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
import { signIn } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  const params = useSearchParams();
  const redefinido = params.get("redefinido") === "1";
  const erroCb = params.get("erro") === "callback";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse com sua conta institucional</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          {redefinido && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2">
              <CheckCircle2 className="size-4 shrink-0" />
              Senha redefinida com sucesso. Faça login.
            </div>
          )}

          {erroCb && (
            <p className="text-sm text-destructive text-center">
              Link inválido ou expirado. Solicite um novo.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@caarapo.ms.gov.br"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <Link
                href="/recuperar"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="senha"
              name="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive text-center">
              {state.error}
            </p>
          )}

          <Button className="w-full mt-1" type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Problemas de acesso? Fale com o administrador do sistema.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
