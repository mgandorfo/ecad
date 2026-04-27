"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClockIcon } from "lucide-react";

interface TempoEsperaProps {
  desde: string;
  className?: string;
}

export function TempoEspera({ desde, className }: TempoEsperaProps) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      setLabel(formatDistanceToNow(new Date(desde), { addSuffix: false, locale: ptBR }));
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [desde]);

  if (!label) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className ?? ""}`}>
      <ClockIcon className="size-3" />
      {label}
    </span>
  );
}
