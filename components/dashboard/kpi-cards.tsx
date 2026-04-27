"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, Timer } from "lucide-react";

interface KPICardsProps {
  total: number;
  emEspera: number;
  concluidos: number;
  tempoMedio: number;
}

export function KPICards({ total, emEspera, concluidos, tempoMedio }: KPICardsProps) {
  const cards = [
    {
      label: "Total no período",
      value: total,
      sub: "atendimentos registrados",
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      label: "Em espera",
      value: emEspera,
      sub: "aguardando atendimento",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Concluídos hoje",
      value: concluidos,
      sub: "finalizados no dia",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Tempo médio",
      value: `${tempoMedio}min`,
      sub: "por atendimento concluído",
      icon: Timer,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <Icon className={`size-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
