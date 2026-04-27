"use client";

import { mockAtendimentos } from "@/lib/mocks/atendimentos";
import type { Atendimento } from "@/lib/types";

// Módulo singleton — persiste durante a sessão (substituído por Supabase no M10)
let store: Atendimento[] = [...mockAtendimentos];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const atendimentosStore = {
  getAll(): Atendimento[] {
    return store;
  },

  getById(id: string): Atendimento | undefined {
    return store.find((a) => a.id === id);
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  add(atendimento: Atendimento) {
    store = [atendimento, ...store];
    notify();
  },

  updateStatus(id: string, statusId: string, statusObj: Atendimento["status"]) {
    store = store.map((a) =>
      a.id === id
        ? {
            ...a,
            status_id: statusId,
            status: statusObj,
            atualizado_em: new Date().toISOString(),
          }
        : a
    );
    notify();
  },

  concluir(id: string, statusConcluido: Atendimento["status"]) {
    store = store.map((a) =>
      a.id === id
        ? {
            ...a,
            status_id: statusConcluido?.id ?? a.status_id,
            status: statusConcluido,
            concluido_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString(),
          }
        : a
    );
    notify();
  },

  assumir(id: string, servidorId: string, servidor: Atendimento["servidor"], statusEmAtendimento: Atendimento["status"]) {
    store = store.map((a) =>
      a.id === id
        ? {
            ...a,
            servidor_id: servidorId,
            servidor,
            status_id: statusEmAtendimento?.id ?? a.status_id,
            status: statusEmAtendimento,
            atualizado_em: new Date().toISOString(),
          }
        : a
    );
    notify();
  },

  adicionarAnotacao(id: string, anotacao: string) {
    store = store.map((a) =>
      a.id === id
        ? {
            ...a,
            anotacoes: anotacao,
            atualizado_em: new Date().toISOString(),
          }
        : a
    );
    notify();
  },
};
