import { AdminGuard } from "@/components/admin/admin-guard";
import { SetoresClient } from "./setores-client";
import { listarSetores } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SetoresPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const { items, total } = await listarSetores(q, pageNum);

  return (
    <AdminGuard>
      <SetoresClient initialItems={items} initialTotal={total} />
    </AdminGuard>
  );
}
