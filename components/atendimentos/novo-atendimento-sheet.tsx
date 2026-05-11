"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AtendimentoForm, type AtendimentoFormData } from "@/components/atendimentos/atendimento-form";
import { BeneficiarioForm, type BeneficiarioFormData } from "@/components/beneficiarios/beneficiario-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { criarAtendimento } from "@/app/(app)/atendimentos/actions";
import { criarBeneficiario } from "@/app/(app)/beneficiarios/actions";
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
  const [cadastroOpen, setCadastroOpen] = useState(false);
  // beneficiário pré-selecionado após cadastro inline
  const [beneficiarioCriado, setBeneficiarioCriado] = useState<Beneficiario | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) setFormKey((k) => k + 1);
      if (!next) setBeneficiarioCriado(null);
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

  async function handleCadastrarBeneficiario(data: BeneficiarioFormData) {
    const result = await criarBeneficiario(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Beneficiário cadastrado.");
    setBeneficiarioCriado(result.data);
    setCadastroOpen(false);
    // força remount do AtendimentoForm com o beneficiário já selecionado
    setFormKey((k) => k + 1);
  }

  return (
    <>
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
              beneficiarioInicial={beneficiarioCriado}
              onCadastrarNovoBeneficiario={() => setCadastroOpen(true)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={cadastroOpen} onOpenChange={setCadastroOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Cadastrar Beneficiário</SheetTitle>
            <SheetDescription>
              Após salvar, o beneficiário será selecionado automaticamente.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            <BeneficiarioForm onSave={handleCadastrarBeneficiario} onCancel={() => setCadastroOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
