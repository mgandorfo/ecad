"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Beneficiario } from "@/lib/types";
import { formatCpf, formatCep, stripCpf, validateCpf } from "@/lib/utils/cpf";

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(150),
  cpf: z
    .string()
    .min(1, "CPF obrigatório")
    .refine((v) => validateCpf(v), "CPF inválido"),
  logradouro: z.string().min(1, "Logradouro obrigatório").max(200),
  numero: z.string().min(1, "Número obrigatório").max(10),
  complemento: z.string().max(100).optional(),
  bairro: z.string().min(1, "Bairro obrigatório").max(100),
  cidade: z.string().min(1, "Cidade obrigatória").max(100),
  uf: z.string().length(2, "UF inválida"),
  cep: z.string().optional(),
  prioritario: z.boolean(),
});

export type BeneficiarioFormData = z.infer<typeof schema>;

interface BeneficiarioFormProps {
  initial?: Beneficiario;
  onSave: (data: BeneficiarioFormData) => Promise<void>;
  onCancel?: () => void;
}

export function BeneficiarioForm({ initial, onSave, onCancel }: BeneficiarioFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [cpfValue, setCpfValue] = useState(initial ? formatCpf(initial.cpf) : "");
  const [cepValue, setCepValue] = useState(initial?.cep ?? "");
  const [prioritario, setPrioritario] = useState(initial?.prioritario ?? false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BeneficiarioFormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          nome: initial.nome,
          cpf: initial.cpf,
          logradouro: initial.logradouro,
          numero: initial.numero,
          complemento: initial.complemento ?? "",
          bairro: initial.bairro,
          cidade: initial.cidade,
          uf: initial.uf,
          cep: initial.cep ?? "",
          prioritario: initial.prioritario,
        }
      : { cidade: "Caarapo", uf: "MS", prioritario: false },
  });

  useEffect(() => {
    setValue("cpf", stripCpf(cpfValue), { shouldValidate: cpfValue.length === 14 });
  }, [cpfValue, setValue]);

  useEffect(() => {
    setValue("cep", cepValue.replace(/\D/g, ""));
  }, [cepValue, setValue]);

  async function onSubmit(data: BeneficiarioFormData) {
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpfValue(formatCpf(e.target.value));
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCepValue(formatCep(e.target.value));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Dados pessoais */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-muted-foreground mb-2">
          Dados pessoais
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="b-nome">Nome Completo</Label>
            <Input
              id="b-nome"
              {...register("nome")}
              placeholder="Ex: Maria das Graças Pereira"
              aria-invalid={!!errors.nome}
            />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-cpf">CPF</Label>
            <Input
              id="b-cpf"
              value={cpfValue}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              aria-invalid={!!errors.cpf}
            />
            {errors.cpf && (
              <p className="text-xs text-destructive">{errors.cpf.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Endereço */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-muted-foreground mb-2">
          Endereço
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="b-logradouro">Logradouro</Label>
            <Input
              id="b-logradouro"
              {...register("logradouro")}
              placeholder="Ex: Rua das Flores"
              aria-invalid={!!errors.logradouro}
            />
            {errors.logradouro && (
              <p className="text-xs text-destructive">
                {errors.logradouro.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-numero">Número</Label>
            <Input
              id="b-numero"
              {...register("numero")}
              placeholder="Ex: 123"
              aria-invalid={!!errors.numero}
            />
            {errors.numero && (
              <p className="text-xs text-destructive">
                {errors.numero.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="b-complemento">
              Complemento{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Input
              id="b-complemento"
              {...register("complemento")}
              placeholder="Ex: Apto 2, Bloco B"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-cep">CEP</Label>
            <Input
              id="b-cep"
              value={cepValue}
              onChange={handleCepChange}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-bairro">Bairro</Label>
            <Input
              id="b-bairro"
              {...register("bairro")}
              placeholder="Ex: Centro"
              aria-invalid={!!errors.bairro}
            />
            {errors.bairro && (
              <p className="text-xs text-destructive">
                {errors.bairro.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-cidade">Cidade</Label>
            <Input
              id="b-cidade"
              {...register("cidade")}
              placeholder="Ex: Caarapo"
              aria-invalid={!!errors.cidade}
            />
            {errors.cidade && (
              <p className="text-xs text-destructive">
                {errors.cidade.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="b-uf">UF</Label>
            <select
              id="b-uf"
              {...register("uf")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-invalid={!!errors.uf}
            >
              {UF_OPTIONS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {errors.uf && (
              <p className="text-xs text-destructive">{errors.uf.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Atendimento prioritário */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-muted-foreground mb-2">
          Prioridade
        </legend>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Beneficiário prioritário</p>
            <p className="text-xs text-muted-foreground">
              Novos atendimentos deste beneficiário já iniciarão como prioritários
            </p>
          </div>
          <Switch
            checked={prioritario}
            onCheckedChange={(checked) => {
              setPrioritario(checked);
              setValue("prioritario", checked);
            }}
          />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => onCancel ? onCancel() : router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2Icon className="animate-spin" />}
          {initial ? "Salvar alterações" : "Cadastrar beneficiário"}
        </Button>
      </div>
    </form>
  );
}
