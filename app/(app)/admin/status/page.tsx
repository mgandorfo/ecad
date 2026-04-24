import { AdminGuard } from "@/components/admin/admin-guard";
import { StatusClient } from "./status-client";

export default function StatusPage() {
  return (
    <AdminGuard>
      <StatusClient />
    </AdminGuard>
  );
}
