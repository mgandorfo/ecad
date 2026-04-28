import { AdminGuard } from "@/components/admin/admin-guard";
import { ServicosClient } from "./servicos-client";
import { listarServicos, listarSetoresAtivos } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ServicosPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const [{ items, total }, setores] = await Promise.all([
    listarServicos(q, pageNum),
    listarSetoresAtivos(),
  ]);

  return (
    <AdminGuard>
      <ServicosClient initialItems={items} initialTotal={total} setores={setores} />
    </AdminGuard>
  );
}
