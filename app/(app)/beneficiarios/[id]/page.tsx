"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  PencilIcon,
  XIcon,
  ClockIcon,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { BeneficiarioGuard } from "@/components/beneficiarios/beneficiario-guard";
import { BeneficiarioForm, type BeneficiarioFormData } from "@/components/beneficiarios/beneficiario-form";
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
import { mockBeneficiarios, mockAtendimentos } from "@/lib/mocks";
import { formatCpf } from "@/lib/utils/cpf";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BeneficiarioDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const beneficiario = mockBeneficiarios.find((b) => b.id === id);

  if (!beneficiario) {
    return (
      <BeneficiarioGuard>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
          <p className="text-lg font-semibold">Beneficiário não encontrado</p>
          <p className="text-sm">
            O registro solicitado não existe ou foi removido.
          </p>
          <Link
            href="/beneficiarios"
            className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
          >
            <ArrowLeftIcon />
            Voltar para a lista
          </Link>
        </div>
      </BeneficiarioGuard>
    );
  }

  const atendimentos = mockAtendimentos.filter(
    (a) => a.beneficiario_id === id
  );

  async function handleSave(data: BeneficiarioFormData) {
    await new Promise((r) => setTimeout(r, 500));
    const idx = mockBeneficiarios.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockBeneficiarios[idx] = {
        ...mockBeneficiarios[idx],
        nome: data.nome,
        cpf: data.cpf,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: data.cep,
      };
    }
    toast.success("Beneficiário atualizado com sucesso.");
    setEditing(false);
  }

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

  return (
    <BeneficiarioGuard>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={editing ? "Editar Beneficiário" : beneficiario.nome}
          description={editing ? "Atualize os dados do beneficiário" : `CPF: ${formatCpf(beneficiario.cpf)}`}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
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
            {/* Dados pessoais */}
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                Dados pessoais
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <InfoRow label="Nome Completo" value={beneficiario.nome} />
                </div>
                <InfoRow label="CPF" value={formatCpf(beneficiario.cpf)} />
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
                {format(new Date(beneficiario.criado_em), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </div>
            </section>

            {/* Histórico de atendimentos */}
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
                          onClick={() =>
                            router.push(`/atendimentos/${a.id}`)
                          }
                        >
                          <TableCell className="text-sm">
                            {format(
                              new Date(a.criado_em),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.setor?.nome ?? a.setor_id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.servico?.nome ?? a.servico_id}
                          </TableCell>
                          <TableCell>
                            {a.status ? (
                              <Badge
                                style={{
                                  backgroundColor: a.status.cor,
                                  color: "#fff",
                                }}
                              >
                                {a.status.nome}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {a.prioritario ? (
                              <Badge variant="destructive">Prioritário</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Normal
                              </span>
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
    </BeneficiarioGuard>
  );
}
