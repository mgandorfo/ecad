"use client";

import { useActionState } from "react";
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
import { redefinirSenha } from "@/app/actions/auth";

export default function RedefinirPage() {
  const [state, action, pending] = useActionState(redefinirSenha, null);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
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
            {state?.fieldErrors?.senha && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.senha[0]}
              </p>
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
            {state?.fieldErrors?.confirmacao && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.confirmacao[0]}
              </p>
            )}
          </div>

          {state?.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
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
