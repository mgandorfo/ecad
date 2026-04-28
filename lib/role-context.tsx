"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/types";

const RoleContext = createContext<Role | null>(null);

export function RoleProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): Role {
  const role = useContext(RoleContext);
  if (role === null) {
    throw new Error("useRole deve ser usado dentro do AppShell");
  }
  return role;
}
