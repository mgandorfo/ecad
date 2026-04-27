"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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

import { mockSetores } from "@/lib/mocks/setores";
import { mockServicos } from "@/lib/mocks/servicos";
import type { Beneficiario } from "@/lib/types";

const schema = z.object({
  beneficiario_id: z.string().min(1, "Selecione um beneficiário"),
  setor_id: z.string().min(1, "Selecione um setor"),
  servico_id: z.string().min(1, "Selecione um serviço"),
  prioritario: z.boolean(),
  anotacoes: z.string().optional(),
});

export type AtendimentoFormData = z.infer<typeof schema>;

interface AtendimentoFormProps {
  onSave: (data: AtendimentoFormData, beneficiario: Beneficiario) => Promise<void>;
}

export function AtendimentoForm({ onSave }: AtendimentoFormProps) {
  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
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

  const setorId = watch("setor_id");
  const prioritario = watch("prioritario");

  const servicosFiltrados = useMemo(
    () => mockServicos.filter((s) => s.setor_id === setorId && s.ativo),
    [setorId]
  );

  const setoresAtivos = mockSetores.filter((s) => s.ativo);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Beneficiário */}
      <Card>
        <CardContent className="pt-6">
          <BeneficiarioAutocomplete
            value={beneficiario}
            onChange={(b) => {
              setBeneficiario(b);
              setValue("beneficiario_id", b?.id ?? "");
            }}
            error={errors.beneficiario_id?.message}
          />
        </CardContent>
      </Card>

      {/* Setor e Serviço */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setor">Setor</Label>
            <Controller
              name="setor_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("servico_id", "");
                  }}
                >
                  <SelectTrigger id="setor" aria-invalid={!!errors.setor_id}>
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
              )}
            />
            {errors.setor_id && (
              <p className="text-xs text-destructive">{errors.setor_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servico">Serviço</Label>
            <Controller
              name="servico_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!setorId}
                >
                  <SelectTrigger id="servico" aria-invalid={!!errors.servico_id}>
                    <SelectValue
                      placeholder={
                        setorId ? "Selecione o serviço..." : "Selecione um setor primeiro"
                      }
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
              )}
            />
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
            <Controller
              name="prioritario"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
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
