import { AdminGuard } from "@/components/admin/admin-guard";
import { ServicosClient } from "./servicos-client";

export default function ServicosPage() {
  return (
    <AdminGuard>
      <ServicosClient />
    </AdminGuard>
  );
}
