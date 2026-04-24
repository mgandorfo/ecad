import { PageHeader } from "@/components/layout/page-header";

export default function PerfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Meu Perfil" description="Gerencie suas informações" />
      <p className="text-muted-foreground">Em construção...</p>
    </div>
  );
}
