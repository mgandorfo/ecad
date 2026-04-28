"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
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
import { recuperarSenha } from "@/app/actions/auth";

export default function RecuperarPage() {
  const [state, action, pending] = useActionState(recuperarSenha, null);

  if (state?.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="size-10 text-primary" />
          </div>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de redefinição de senha. Verifique sua caixa de
            entrada e a pasta de spam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Voltar ao login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber o link de redefinição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
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

          {state?.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          <Button className="w-full mt-1" type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar link de redefinição"
            )}
          </Button>

          <Link href="/login">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Voltar ao login
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
