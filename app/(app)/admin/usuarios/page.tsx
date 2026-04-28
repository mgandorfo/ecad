import { AdminGuard } from "@/components/admin/admin-guard";
import { UsuariosClient } from "./usuarios-client";
import { listarUsuarios } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const { items, total } = await listarUsuarios(q, pageNum);

  return (
    <AdminGuard>
      <UsuariosClient initialItems={items} initialTotal={total} />
    </AdminGuard>
  );
}
