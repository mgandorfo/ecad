"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  SaveIcon,
  UserCheckIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";
import Link from "next/link";

import { atendimentosStore } from "@/lib/stores/atendimentos";
import { mockStatus } from "@/lib/mocks/status";
import { mockUsuarios } from "@/lib/mocks/usuarios";
import type { Atendimento } from "@/lib/types";
import { useRole } from "@/lib/role-context";

import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/atendimentos/status-badge";
import { PrioridadeBadge } from "@/components/atendimentos/prioridade-badge";
import { formatDateTime } from "@/lib/format";
import { formatCpf } from "@/lib/utils/cpf";

const SERVIDOR_MOCK_ID = "u2";
const STATUS_CONCLUIDO = mockStatus.find((s) => s.nome === "Concluído") ?? mockStatus[2];

interface AtendimentoDetalheClientProps {
  id: string;
}

export function AtendimentoDetalheClient({ id }: AtendimentoDetalheClientProps) {
  const router = useRouter();
  const role = useRole();

  const [atendimento, setAtendimento] = useState<Atendimento | undefined>(() =>
    atendimentosStore.getById(id)
  );
  const [anotacoes, setAnotacoes] = useState(atendimento?.anotacoes ?? "");
  const [statusSelecionado, setStatusSelecionado] = useState(atendimento?.status_id ?? "");
  const [savingAnotacao, setSavingAnotacao] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [confirmConcluir, setConfirmConcluir] = useState(false);
  const [assumirConfirm, setAssumirConfirm] = useState(false);

  useEffect(() => {
    return atendimentosStore.subscribe(() => {
      const updated = atendimentosStore.getById(id);
      setAtendimento(updated);
      // Não sobrescreve anotacoes/statusSelecionado: o usuário edita e salva explicitamente.
      // Esses campos só precisam ser re-sincronizados se o atendimento foi concluído externamente.
      if (updated?.concluido_em) {
        setStatusSelecionado(updated.status_id);
      }
    });
  }, [id]);

  if (!atendimento) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
        <p className="text-sm">Atendimento não encontrado.</p>
        <Link href="/fila" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeftIcon />
          Voltar para a fila
        </Link>
      </div>
    );
  }

  const isConcluido = !!atendimento.concluido_em;
  const isMeuAtendimento = atendimento.servidor_id === SERVIDOR_MOCK_ID;
  const temServidor = !!atendimento.servidor_id;
  const canEdit =
    !isConcluido && temServidor && (role === "admin" || (role === "entrevistador" && isMeuAtendimento));
  const canConcluir = canEdit;
  const canAssume =
    !isConcluido &&
    !temServidor &&
    (role === "admin" || role === "entrevistador");

  async function handleSalvarStatus() {
    if (statusSelecionado === atendimento!.status_id) return;
    setSavingStatus(true);
    await new Promise((r) => setTimeout(r, 300));
    const novoStatus = mockStatus.find((s) => s.id === statusSelecionado);
    atendimentosStore.updateStatus(id, statusSelecionado, novoStatus);
    toast.success("Status atualizado.");
    setSavingStatus(false);
  }

  async function handleSalvarAnotacao() {
    setSavingAnotacao(true);
    await new Promise((r) => setTimeout(r, 300));
    atendimentosStore.adicionarAnotacao(id, anotacoes);
    toast.success("Anotações salvas.");
    setSavingAnotacao(false);
  }

  function handleConcluirConfirm() {
    atendimentosStore.concluir(id, STATUS_CONCLUIDO);
    toast.success("Atendimento concluído.");
    setConfirmConcluir(false);
    router.push("/meus-atendimentos");
  }

  function handleAssumirConfirm() {
    const servidor = mockUsuarios.find((u) => u.id === SERVIDOR_MOCK_ID);
    const statusEmAtendimento = mockStatus.find((s) => s.nome === "Em Atendimento") ?? mockStatus[1];
    atendimentosStore.assumir(id, SERVIDOR_MOCK_ID, servidor, statusEmAtendimento);
    toast.success("Atendimento assumido.");
    setAssumirConfirm(false);
  }

  const b = atendimento.beneficiario;
  const endereco = b
    ? [b.logradouro, b.numero, b.complemento, b.bairro, `${b.cidade}/${b.uf}`]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Atendimento — ${atendimento.beneficiario?.nome ?? id}`}
        description={`Registrado em ${formatDateTime(atendimento.criado_em)}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/fila"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeftIcon />
              Fila
            </Link>
            {canAssume && (
              <Button size="sm" onClick={() => setAssumirConfirm(true)}>
                <UserCheckIcon />
                Assumir
              </Button>
            )}
            {canConcluir && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmConcluir(true)}
              >
                <CheckCircle2Icon />
                Concluir atendimento
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={atendimento.status} />
                <PrioridadeBadge prioritario={atendimento.prioritario} showNormal />
                {isConcluido && (
                  <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-600">
                    <CheckCircle2Icon className="size-3" />
                    Encerrado
                  </Badge>
                )}
              </div>

              {canEdit && (
                <div className="flex items-end gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label htmlFor="status-select">Alterar status</Label>
                    <Select value={statusSelecionado} onValueChange={(v) => { if (v !== null) setStatusSelecionado(v); }}>
                      <SelectTrigger id="status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStatus.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSalvarStatus}
                    disabled={savingStatus || statusSelecionado === atendimento.status_id}
                    size="sm"
                  >
                    <SaveIcon />
                    {savingStatus ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Anotações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Anotações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {canEdit ? (
                <>
                  <Textarea
                    value={anotacoes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnotacoes(e.target.value)}
                    placeholder="Registre observações sobre este atendimento..."
                    rows={6}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingAnotacao || anotacoes === (atendimento.anotacoes ?? "")}
                      onClick={handleSalvarAnotacao}
                    >
                      <SaveIcon />
                      {savingAnotacao ? "Salvando..." : "Salvar anotações"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {atendimento.anotacoes || "Nenhuma anotação registrada."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <ClockIcon className="size-3.5" />
                    Registrado em
                  </dt>
                  <dd className="font-medium mt-0.5">{formatDateTime(atendimento.criado_em)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <ClockIcon className="size-3.5" />
                    Última atualização
                  </dt>
                  <dd className="font-medium mt-0.5">{formatDateTime(atendimento.atualizado_em)}</dd>
                </div>
                {atendimento.concluido_em && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2Icon className="size-3.5 text-emerald-600" />
                      Concluído em
                    </dt>
                    <dd className="font-medium mt-0.5 text-emerald-600">
                      {formatDateTime(atendimento.concluido_em)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar de informações */}
        <div className="flex flex-col gap-6">
          {/* Beneficiário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Beneficiário</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <p className="font-semibold">{b?.nome ?? "—"}</p>
                <p className="text-muted-foreground font-mono text-xs mt-0.5">
                  {b ? formatCpf(b.cpf) : "—"}
                </p>
              </div>
              {endereco && (
                <div className="flex gap-1.5 text-muted-foreground">
                  <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
                  <p className="text-xs">{endereco}</p>
                </div>
              )}
              <Link
                href={`/beneficiarios/${b?.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ver cadastro completo
              </Link>
            </CardContent>
          </Card>

          {/* Setor e Serviço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Serviço</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Setor</p>
                <p className="font-medium">
                  {atendimento.setor?.codigo} — {atendimento.setor?.nome}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs">Serviço</p>
                <p className="font-medium">
                  {atendimento.servico?.codigo} — {atendimento.servico?.nome}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Servidor responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Responsável</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {atendimento.servidor ? (
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{atendimento.servidor.nome}</p>
                  <p className="text-xs text-muted-foreground">{atendimento.servidor.email}</p>
                  <Badge variant="outline" className="w-fit mt-1 capitalize">
                    {atendimento.servidor.role}
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum servidor assumiu este atendimento.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: concluir */}
      <AlertDialog open={confirmConcluir} onOpenChange={setConfirmConcluir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              O status será alterado para <strong>Concluído</strong> e o atendimento será
              encerrado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConcluirConfirm}>
              Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: assumir */}
      <AlertDialog open={assumirConfirm} onOpenChange={setAssumirConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assumir atendimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será registrado como responsável. O status será alterado para{" "}
              <em>Em Atendimento</em>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssumirConfirm}>Assumir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
