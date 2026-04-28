import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Decoração de fundo sutil */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Logo centralizada com tagline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground">
            Prefeitura Municipal de Caarapo&nbsp;&mdash;&nbsp;MS
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
