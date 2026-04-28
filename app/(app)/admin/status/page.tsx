import { AdminGuard } from "@/components/admin/admin-guard";
import { StatusClient } from "./status-client";
import { listarStatus } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function StatusPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const { items, total } = await listarStatus(q, pageNum);

  return (
    <AdminGuard>
      <StatusClient initialItems={items} initialTotal={total} />
    </AdminGuard>
  );
}
