"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
    <Card className="shadow-lg border border-border/60">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Entrar no sistema</CardTitle>
        <CardDescription>Acesse com sua conta institucional</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form action={action} className="flex flex-col gap-5">
          {redefinido && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              Senha redefinida com sucesso. Faça login.
            </div>
          )}

          {erroCb && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              Link inválido ou expirado. Solicite um novo.
            </div>
          )}

          {state?.error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <Link
                href="/recuperar"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
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

          <Button className="w-full" size="lg" type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Problemas de acesso?{" "}
            <span className="text-foreground/70">
              Fale com o administrador do sistema.
            </span>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
