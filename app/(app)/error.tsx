"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center px-4">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-7" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Erro ao carregar a página</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Não foi possível exibir este conteúdo. Tente novamente ou navegue para outra seção.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">Código: {error.digest}</p>
        )}
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
