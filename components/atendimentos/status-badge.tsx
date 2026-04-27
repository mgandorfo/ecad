import { Badge } from "@/components/ui/badge";
import type { StatusAtendimento } from "@/lib/types";

interface StatusBadgeProps {
  status: StatusAtendimento | undefined;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return <Badge variant="outline">—</Badge>;
  return (
    <Badge
      style={{ backgroundColor: status.cor, color: "#fff", borderColor: status.cor }}
    >
      {status.nome}
    </Badge>
  );
}
