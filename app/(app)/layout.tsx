import { getRequiredUser } from "@/lib/supabase/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getRequiredUser();
  return <AppShell user={user}>{children}</AppShell>;
}
