"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { BeneficiarioAutocomplete } from "@/components/beneficiarios/beneficiario-autocomplete";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";

import type { Beneficiario, Setor, Servico } from "@/lib/types";

const schema = z.object({
  beneficiario_id: z.string().min(1, "Selecione um beneficiário"),
  setor_id: z.string().min(1, "Selecione um setor"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  prioritario: z.boolean(),
  anotacoes: z.string().max(5000).optional(),
});

export type AtendimentoFormData = z.infer<typeof schema>;

interface AtendimentoFormProps {
  setores: Setor[];
  servicos: Servico[];
  onSave: (data: AtendimentoFormData, beneficiario: Beneficiario) => Promise<void>;
}

export function AtendimentoForm({ setores, servicos, onSave }: AtendimentoFormProps) {
  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);
  const [setorId, setSetorId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [prioritario, setPrioritario] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AtendimentoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      beneficiario_id: "",
      setor_id: "",
      servico_id: "",
      prioritario: false,
      anotacoes: "",
    },
  });

  const setoresAtivos = setores.filter((s) => s.ativo);
  const servicosFiltrados = useMemo(
    () => servicos.filter((s) => s.setor_id === setorId && s.ativo),
    [servicos, setorId]
  );

  function handleSetorChange(v: string | null) {
    if (!v) return;
    setSetorId(v);
    setServicoId("");
    setValue("setor_id", v, { shouldValidate: true });
    setValue("servico_id", "", { shouldValidate: false });
  }

  function handleServicoChange(v: string | null) {
    if (!v) return;
    setServicoId(v);
    setValue("servico_id", v, { shouldValidate: true });
  }

  function handlePrioritarioChange(checked: boolean) {
    setPrioritario(checked);
    setValue("prioritario", checked);
  }

  async function onSubmit(data: AtendimentoFormData) {
    if (!beneficiario) {
      toast.error("Selecione um beneficiário.");
      return;
    }
    setSaving(true);
    try {
      await onSave(data, beneficiario);
    } finally {
      setSaving(false);
    }
  }

  // Monta o mapa de itens para o Base UI resolver os labels no SelectValue
  const setorItems = useMemo(
    () => setoresAtivos.map((s) => ({ value: s.id, label: `${s.codigo} — ${s.nome}` })),
    [setoresAtivos]
  );
  const servicoItems = useMemo(
    () => servicosFiltrados.map((s) => ({ value: s.id, label: `${s.codigo} — ${s.nome}` })),
    [servicosFiltrados]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Beneficiário */}
      <Card>
        <CardContent className="pt-6">
          <BeneficiarioAutocomplete
            value={beneficiario}
            onChange={(b) => {
              setBeneficiario(b);
              setValue("beneficiario_id", b?.id ?? "", { shouldValidate: !!b });
            }}
            error={errors.beneficiario_id?.message}
          />
        </CardContent>
      </Card>

      {/* Setor e Serviço */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setor-trigger">Setor</Label>
            <Select
              value={setorId || null}
              onValueChange={handleSetorChange}
              items={setorItems}
            >
              <SelectTrigger id="setor-trigger" aria-invalid={!!errors.setor_id}>
                <SelectValue placeholder="Selecione o setor..." />
              </SelectTrigger>
              <SelectContent>
                {setoresAtivos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.setor_id && (
              <p className="text-xs text-destructive">{errors.setor_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servico-trigger">Serviço</Label>
            <Select
              value={servicoId || null}
              onValueChange={handleServicoChange}
              disabled={!setorId}
              items={servicoItems}
            >
              <SelectTrigger id="servico-trigger" aria-invalid={!!errors.servico_id}>
                <SelectValue
                  placeholder={setorId ? "Selecione o serviço..." : "Selecione um setor primeiro"}
                />
              </SelectTrigger>
              <SelectContent>
                {servicosFiltrados.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codigo} — {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.servico_id && (
              <p className="text-xs text-destructive">{errors.servico_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prioridade */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Atendimento Prioritário</p>
              <p className="text-xs text-muted-foreground">
                Sobe este atendimento ao topo da fila
              </p>
            </div>
            <Switch checked={prioritario} onCheckedChange={handlePrioritarioChange} />
          </div>
          {prioritario && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangleIcon className="size-4 shrink-0" />
              Este atendimento terá prioridade sobre os demais na fila.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anotações */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-1.5">
          <Label htmlFor="anotacoes">Anotações</Label>
          <Textarea
            id="anotacoes"
            placeholder="Observações relevantes sobre o atendimento..."
            rows={4}
            {...register("anotacoes")}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Registrando..." : "Registrar Atendimento"}
        </Button>
      </div>
    </form>
  );
}
