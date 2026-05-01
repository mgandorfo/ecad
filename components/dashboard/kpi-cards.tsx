"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, Timer } from "lucide-react";

interface KPICardsProps {
  total: number;
  emEspera: number;
  concluidos: number;
  tempoMedio: number;
}

const cards = (props: KPICardsProps) => [
  {
    label: "Total no período",
    value: props.total,
    sub: "atendimentos registrados",
    icon: ClipboardList,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    accent: "border-l-primary",
  },
  {
    label: "Em espera",
    value: props.emEspera,
    sub: "aguardando atendimento",
    icon: Clock,
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    accent: "border-l-yellow-500",
  },
  {
    label: "Concluídos no período",
    value: props.concluidos,
    sub: "finalizados no período selecionado",
    icon: CheckCircle,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    accent: "border-l-green-500",
  },
  {
    label: "Tempo médio",
    value: `${props.tempoMedio}min`,
    sub: "por atendimento concluído",
    icon: Timer,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    accent: "border-l-blue-500",
  },
];

export function KPICards(props: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards(props).map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`border-l-4 ${card.accent} transition-shadow hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[13px] font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={`rounded-lg p-1.5 ${card.iconBg}`}>
                <Icon className={`size-3.5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-[28px] font-bold tracking-[-0.02em] leading-none">
                {card.value}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
