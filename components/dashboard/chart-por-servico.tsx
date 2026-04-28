"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartPorServicoProps {
  data: { servico: string; total: number }[];
}

function abreviar(nome: string, max = 16) {
  return nome.length > max ? nome.slice(0, max) + "…" : nome;
}

export function ChartPorServico({ data }: ChartPorServicoProps) {
  const dataAbrev = data.map((d) => ({ ...d, servicoAbrev: abreviar(d.servico) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Atendimentos por serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={dataAbrev}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis
              type="category"
              dataKey="servicoAbrev"
              tick={{ fontSize: 11 }}
              width={120}
              className="fill-muted-foreground"
            />
            <Tooltip
              formatter={(value, _name, props) => [value, props.payload.servico]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="total" name="Atendimentos" fill="#7C4DBC" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
