import { AdminGuard } from "@/components/admin/admin-guard";
import { SetoresClient } from "./setores-client";

export default function SetoresPage() {
  return (
    <AdminGuard>
      <SetoresClient />
    </AdminGuard>
  );
}
