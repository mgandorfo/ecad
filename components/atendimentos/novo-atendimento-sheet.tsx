"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimentos/atendimento-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { atendimentosStore } from "@/lib/stores/atendimentos";
import { mockSetores } from "@/lib/mocks/setores";
import { mockServicos } from "@/lib/mocks/servicos";
import { mockStatus } from "@/lib/mocks/status";
import type { Beneficiario } from "@/lib/types";

interface NovoAtendimentoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoAtendimentoSheet({ open, onOpenChange }: NovoAtendimentoSheetProps) {
  async function handleSave(data: AtendimentoFormData, beneficiario: Beneficiario) {
    await new Promise((r) => setTimeout(r, 400));

    const statusInicial = mockStatus.find((s) => s.ordem === 1) ?? mockStatus[0];
    const setor = mockSetores.find((s) => s.id === data.setor_id);
    const servico = mockServicos.find((s) => s.id === data.servico_id);

    atendimentosStore.add({
      id: `a${Date.now()}`,
      beneficiario_id: data.beneficiario_id,
      setor_id: data.setor_id,
      servico_id: data.servico_id,
      status_id: statusInicial.id,
      servidor_id: null,
      criado_por: "mock",
      prioritario: data.prioritario,
      anotacoes: data.anotacoes ?? null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      assumido_em: null,
      concluido_em: null,
      beneficiario,
      setor,
      servico,
      status: statusInicial,
      servidor: undefined,
    });

    toast.success("Atendimento registrado na fila.");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Novo Atendimento</SheetTitle>
          <SheetDescription>Registre um novo atendimento na fila de espera.</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-6">
          <AtendimentoForm onSave={handleSave} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
