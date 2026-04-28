"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimentos/atendimento-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { criarAtendimento } from "@/app/(app)/atendimentos/actions";
import type { Beneficiario, Setor, Servico } from "@/lib/types";

interface NovoAtendimentoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setores: Setor[];
  servicos: Servico[];
}

export function NovoAtendimentoSheet({
  open,
  onOpenChange,
  setores,
  servicos,
}: NovoAtendimentoSheetProps) {
  const router = useRouter();
  // formKey força remount do AtendimentoForm a cada abertura do Sheet,
  // garantindo que os selects comecem limpos sem estado residual
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) setFormKey((k) => k + 1);
      onOpenChange(next);
    },
    [onOpenChange]
  );

  async function handleSave(data: AtendimentoFormData, _beneficiario: Beneficiario) {
    const result = await criarAtendimento(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Atendimento registrado na fila.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Novo Atendimento</SheetTitle>
          <SheetDescription>Registre um novo atendimento na fila de espera.</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-6">
          <AtendimentoForm
            key={formKey}
            setores={setores}
            servicos={servicos}
            onSave={handleSave}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
