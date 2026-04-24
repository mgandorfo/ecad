import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse com sua conta institucional</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@caarapo.ms.gov.br"
            autoComplete="email"
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
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <Link href="/dashboard">
          <Button className="w-full mt-1">Entrar</Button>
        </Link>

        <p className="text-center text-xs text-muted-foreground">
          Problemas de acesso? Fale com o administrador do sistema.
        </p>
      </CardContent>
    </Card>
  );
}
