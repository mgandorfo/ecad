import { Construction } from "lucide-react";
import { PageHeader } from "./page-header";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  milestone: string;
}

export function PagePlaceholder({ title, description, milestone }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center text-muted-foreground">
        <Construction className="size-8 opacity-30" />
        <p className="text-sm font-medium">Em construção</p>
        <p className="text-xs">Esta tela será implementada no {milestone}.</p>
      </div>
    </div>
  );
}
