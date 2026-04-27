import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon } from "lucide-react";

interface PrioridadeBadgeProps {
  prioritario: boolean;
  showNormal?: boolean;
}

export function PrioridadeBadge({ prioritario, showNormal = false }: PrioridadeBadgeProps) {
  if (!prioritario) {
    if (!showNormal) return null;
    return <Badge variant="outline">Normal</Badge>;
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangleIcon className="size-3" />
      Prioritário
    </Badge>
  );
}
