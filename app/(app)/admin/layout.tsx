import { redirect } from "next/navigation";
import { getRequiredUser } from "@/lib/supabase/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getRequiredUser();
  if (user.role !== "admin") redirect("/dashboard");
  return <>{children}</>;
}
