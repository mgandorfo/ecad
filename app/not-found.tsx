import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo size="lg" showTagline />

      <div className="flex flex-col gap-2">
        <p className="text-8xl font-bold text-primary/20 select-none" aria-hidden="true">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="text-muted-foreground max-w-sm">
          O endereço acessado não existe ou você não tem permissão para visualizá-lo.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Ir para o Dashboard
        </Link>
        <Link href="/atendimentos" className={cn(buttonVariants({ variant: "outline" }))}>
          Ver Atendimentos
        </Link>
      </div>
    </div>
  );
}
