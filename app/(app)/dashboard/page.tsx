import { PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Visão geral dos atendimentos" />
      <p className="text-muted-foreground">Em construção...</p>
    </div>
  );
}
