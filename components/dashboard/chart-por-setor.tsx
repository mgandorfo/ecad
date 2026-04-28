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

interface ChartPorSetorProps {
  data: { setor: string; total: number }[];
}

// Encurta nomes longos para o eixo
function abreviar(nome: string, max = 12) {
  return nome.length > max ? nome.slice(0, max) + "…" : nome;
}

export function ChartPorSetor({ data }: ChartPorSetorProps) {
  const dataAbrev = data.map((d) => ({ ...d, setorAbrev: abreviar(d.setor) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Atendimentos por setor</CardTitle>
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
              dataKey="setorAbrev"
              tick={{ fontSize: 11 }}
              width={90}
              className="fill-muted-foreground"
            />
            <Tooltip
              formatter={(value, _name, props) => [value, props.payload.setor]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="total" name="Atendimentos" fill="#00BFD8" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
