import { getRequiredUser } from "@/lib/supabase/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/types";

const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  entrevistador: "Entrevistador",
  recepcionista: "Recepcionista",
  vigilancia: "Vigilância",
};

const roleColors: Record<Role, string> = {
  admin: "bg-destructive/15 text-destructive border-destructive/20",
  entrevistador: "bg-primary/15 text-primary border-primary/20",
  recepcionista: "bg-chart-3/15 text-chart-3 border-chart-3/20",
  vigilancia: "bg-muted text-muted-foreground border-border",
};

export default async function PerfilPage() {
  const user = await getRequiredUser();

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
              <Badge
                className={`mt-1.5 text-[10px] px-1.5 py-0 font-medium border ${roleColors[user.role]}`}
              >
                {roleLabels[user.role]}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 pt-2 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membro desde</span>
              <span>
                {new Date(user.criado_em).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
