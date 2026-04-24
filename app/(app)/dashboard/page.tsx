import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, CheckCircle, Clock } from "lucide-react";

const kpis = [
  { label: "Atendimentos hoje", value: "—", icon: ClipboardList, color: "text-primary" },
  { label: "Em espera", value: "—", icon: Clock, color: "text-chart-4" },
  { label: "Concluídos", value: "—", icon: CheckCircle, color: "text-chart-3" },
  { label: "Beneficiários", value: "—", icon: Users, color: "text-chart-2" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos atendimentos do dia"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className={`size-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponível após integração com banco de dados
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">Gráficos e relatórios serão implementados no Milestone 6.</p>
      </div>
    </div>
  );
}
