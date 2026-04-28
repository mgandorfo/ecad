"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { concluirOnboarding } from "@/app/actions/onboarding";

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(concluirOnboarding, null);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <ShieldCheck className="size-10 text-primary" />
        </div>
        <CardTitle>Configuração inicial</CardTitle>
        <CardDescription>
          Você é o primeiro usuário do sistema. Confirme seu nome para ser
          configurado como Administrador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Seu nome completo</Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              placeholder="Ex.: Maria Silva"
              autoComplete="name"
              autoFocus
              required
            />
            {state?.error && (
              <p role="alert" className="text-xs text-destructive">{state.error}</p>
            )}
          </div>

          <Button className="w-full mt-1" type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Configurando…
              </>
            ) : (
              "Concluir configuração"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
