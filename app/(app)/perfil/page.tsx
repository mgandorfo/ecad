import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockUsuarios } from "@/lib/mocks/usuarios";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  entrevistador: "Entrevistador",
  recepcionista: "Recepcionista",
  vigilancia: "Vigilância",
};

export default function PerfilPage() {
  const user = mockUsuarios[0];

  const initials = user.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <PageHeader title="Meu Perfil" description="Informações da sua conta" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do usuário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.nome}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-1 text-xs" variant="secondary">
                {roleLabels[user.role]}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 pt-2 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={user.ativo ? "text-chart-3 font-medium" : "text-muted-foreground"}>
                {user.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membro desde</span>
              <span>{new Date(user.criado_em).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Edição de perfil disponível após integração com autenticação (Milestone 8).
      </p>
    </div>
  );
}
