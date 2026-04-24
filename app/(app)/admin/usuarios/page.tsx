import { AdminGuard } from "@/components/admin/admin-guard";
import { UsuariosClient } from "./usuarios-client";

export default function UsuariosPage() {
  return (
    <AdminGuard>
      <UsuariosClient />
    </AdminGuard>
  );
}
