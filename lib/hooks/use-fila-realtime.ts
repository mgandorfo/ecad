"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function useFilaRealtime() {
  const router = useRouter();

  // Cliente criado uma única vez — evita subscriptions duplicadas se o componente re-renderizar
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  // Debounce ref: evita múltiplos router.refresh() em cascata quando vários eventos chegam juntos
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("atendimentos-fila")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "atendimentos" },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            router.refresh();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);
}
