"use client";

import { useEffect } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo size="lg" showTagline />

      <div className="flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-8" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
          <p className="text-muted-foreground max-w-sm">
            Ocorreu um erro inesperado. Tente novamente ou volte ao início.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono">
              Código: {error.digest}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => { reset(); window.location.href = "/dashboard"; }}>
          Ir para o Dashboard
        </Button>
      </div>
    </div>
  );
}
