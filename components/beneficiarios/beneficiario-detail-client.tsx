"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, PencilIcon, XIcon, ClockIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BeneficiarioForm, type BeneficiarioFormData } from "./beneficiario-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { atualizarBeneficiario } from "@/app/(app)/beneficiarios/actions";
import type { Beneficiario, Atendimento } from "@/lib/types";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

interface Props {
  beneficiario: Beneficiario;
  atendimentos: Atendimento[];
  cpfFormatado: string;
}

export function BeneficiarioDetailClient({ beneficiario, atendimentos, cpfFormatado }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const enderecoCompleto = [
    beneficiario.logradouro,
    beneficiario.numero,
    beneficiario.complemento,
    beneficiario.bairro,
    beneficiario.cidade,
    beneficiario.uf,
    beneficiario.cep,
  ]
    .filter(Boolean)
    .join(", ");

  async function handleSave(data: BeneficiarioFormData) {
    startTransition(async () => {
      const result = await atualizarBeneficiario(beneficiario.id, data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Beneficiário atualizado com sucesso.");
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={editing ? "Editar Beneficiário" : beneficiario.nome}
        description={editing ? "Atualize os dados do beneficiário" : `CPF: ${cpfFormatado}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/beneficiarios"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeftIcon />
              Voltar
            </Link>
            {!editing && (
              <Button size="sm" onClick={() => setEditing(true)}>
                <PencilIcon />
                Editar
              </Button>
            )}
            {editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <XIcon />
                Cancelar edição
              </Button>
            )}
          </div>
        }
      />

      {editing ? (
        <div className="max-w-2xl">
          <BeneficiarioForm
            initial={beneficiario}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-2xl">
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground border-b pb-1">
              Dados pessoais
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2">
                <InfoRow label="Nome Completo" value={beneficiario.nome} />
              </div>
              <InfoRow label="CPF" value={cpfFormatado} />
              <div className="col-span-2 sm:col-span-3">
                <InfoRow label="Endereço Completo" value={enderecoCompleto} />
              </div>
              <InfoRow label="CEP" value={beneficiario.cep || "—"} />
              <InfoRow label="Cidade" value={beneficiario.cidade} />
              <InfoRow label="UF" value={beneficiario.uf} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <CalendarIcon className="size-3.5" />
              Cadastrado em{" "}
              {format(new Date(beneficiario.criado_em), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground border-b pb-1">
              Histórico de atendimentos
            </h2>

            {atendimentos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <ClockIcon className="size-8 opacity-30" />
                <p className="text-sm">Nenhum atendimento registrado.</p>
                <p className="text-xs opacity-70">
                  Os atendimentos aparecerão aqui após serem criados.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atendimentos.map((a) => (
                      <TableRow
                        key={a.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/atendimentos/${a.id}`)}
                      >
                        <TableCell className="text-sm">
                          {format(new Date(a.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.setor?.nome ?? a.setor_id}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.servico?.nome ?? a.servico_id}
                        </TableCell>
                        <TableCell>
                          {a.status ? (
                            <Badge style={{ backgroundColor: a.status.cor, color: "#fff" }}>
                              {a.status.nome}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {a.prioritario ? (
                            <Badge variant="destructive">Prioritário</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Normal</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
