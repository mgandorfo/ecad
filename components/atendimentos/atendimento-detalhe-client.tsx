"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  SaveIcon,
  UserCheckIcon,
  ClockIcon,
  MapPinIcon,
  RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";

import {
  assumirAtendimento,
  atualizarStatus,
  atualizarAnotacoes,
  concluirAtendimento,
  trocarEntrevistador,
  type AtendimentoComJoins,
} from "@/app/(app)/atendimentos/actions";
import type { Perfil, StatusAtendimento } from "@/lib/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/atendimentos/status-badge";
import { PrioridadeBadge } from "@/components/atendimentos/prioridade-badge";
import { formatDateTime } from "@/lib/format";
import { formatCpf } from "@/lib/utils/cpf";

interface AtendimentoDetalheClientProps {
  atendimento: AtendimentoComJoins;
  allStatus: StatusAtendimento[];
  entrevistadores: Perfil[];
  userId: string;
}

export function AtendimentoDetalheClient({
  atendimento,
  allStatus,
  entrevistadores,
  userId,
}: AtendimentoDetalheClientProps) {
  const router = useRouter();
  const role = useRole();
  const [isPending, startTransition] = useTransition();

  const [anotacoes, setAnotacoes] = useState(atendimento.anotacoes ?? "");
  const [statusSelecionado, setStatusSelecionado] = useState(atendimento.status_id);
  const [confirmConcluir, setConfirmConcluir] = useState(false);
  const [assumirConfirm, setAssumirConfirm] = useState(false);
  const [trocarDialogOpen, setTrocarDialogOpen] = useState(false);
  const [novoServidorId, setNovoServidorId] = useState("");

  const isConcluido = !!atendimento.concluido_em;
  const isMeuAtendimento = atendimento.servidor_id === userId;
  const temServidor = !!atendimento.servidor_id;

  const canEdit =
    !isConcluido &&
    temServidor &&
    (role === "admin" || (role === "entrevistador" && isMeuAtendimento));

  const canConcluir = canEdit;

  const canAssume =
    !isConcluido && !temServidor && (role === "admin" || role === "entrevistador");

  const canTrocarEntrevistador = !isConcluido && role === "admin";

  function handleSalvarStatus() {
    if (statusSelecionado === atendimento.status_id) return;
    startTransition(async () => {
      const result = await atualizarStatus(atendimento.id, statusSelecionado);
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("Status atualizado.");
      router.refresh();
    });
  }

  function handleSalvarAnotacao() {
    startTransition(async () => {
      const result = await atualizarAnotacoes(atendimento.id, anotacoes);
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("Anotações salvas.");
      router.refresh();
    });
  }

  function handleConcluirConfirm() {
    setConfirmConcluir(false);
    startTransition(async () => {
      const result = await concluirAtendimento(atendimento.id);
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("Atendimento concluído.");
      router.push("/atendimentos?aba=meus");
    });
  }

  function handleAssumirConfirm() {
    setAssumirConfirm(false);
    startTransition(async () => {
      const result = await assumirAtendimento(atendimento.id);
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("Atendimento assumido.");
      router.refresh();
    });
  }

  function handleTrocarEntrevistador() {
    if (!novoServidorId) return;
    setTrocarDialogOpen(false);
    startTransition(async () => {
      const result = await trocarEntrevistador(atendimento.id, novoServidorId);
      if (!result.ok) { toast.error(result.error); return; }
      toast.success("Entrevistador atualizado.");
      setNovoServidorId("");
      router.refresh();
    });
  }

  const b = atendimento.beneficiario;
  const endereco = [b.logradouro, b.numero, b.complemento, b.bairro, `${b.cidade}/${b.uf}`]
    .filter(Boolean)
    .join(", ");

  const entrevistadoresFiltrados = entrevistadores.filter(
    (e) => atendimento.servidor_id === null || e.id !== atendimento.servidor_id
  );

  const statusItems = allStatus.map((s) => ({ value: s.id, label: s.nome }));
  const entrevistadorItems = entrevistadoresFiltrados.map((e) => ({
    value: e.id,
    label: `${e.nome} (${e.role})`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Atendimento — ${atendimento.beneficiario.nome}`}
        description={`Registrado em ${formatDateTime(atendimento.criado_em)}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/atendimentos"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeftIcon />
              Atendimentos
            </Link>
            {canTrocarEntrevistador && (
              <Button size="sm" variant="outline" onClick={() => setTrocarDialogOpen(true)}>
                <RefreshCwIcon />
                Trocar entrevistador
              </Button>
            )}
            {canAssume && (
              <Button size="sm" onClick={() => setAssumirConfirm(true)} disabled={isPending}>
                <UserCheckIcon />
                Assumir
              </Button>
            )}
            {canConcluir && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmConcluir(true)}
                disabled={isPending}
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
                    <Select
                      value={statusSelecionado}
                      onValueChange={(v) => { if (v) setStatusSelecionado(v); }}
                      items={statusItems}
                    >
                      <SelectTrigger id="status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allStatus.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSalvarStatus}
                    disabled={isPending || statusSelecionado === atendimento.status_id}
                    size="sm"
                  >
                    <SaveIcon />
                    {isPending ? "Salvando..." : "Salvar"}
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setAnotacoes(e.target.value)
                    }
                    placeholder="Registre observações sobre este atendimento..."
                    rows={6}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending || anotacoes === (atendimento.anotacoes ?? "")}
                      onClick={handleSalvarAnotacao}
                    >
                      <SaveIcon />
                      {isPending ? "Salvando..." : "Salvar anotações"}
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

          {/* Histórico de datas */}
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
                {atendimento.assumido_em && (
                  <div>
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <UserCheckIcon className="size-3.5" />
                      Assumido em
                    </dt>
                    <dd className="font-medium mt-0.5">{formatDateTime(atendimento.assumido_em)}</dd>
                  </div>
                )}
                {atendimento.concluido_em && (
                  <div>
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

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Beneficiário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Beneficiário</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div>
                <p className="font-semibold">{b.nome}</p>
                <p className="text-muted-foreground font-mono text-xs mt-0.5">
                  {formatCpf(b.cpf)}
                </p>
              </div>
              {endereco && (
                <div className="flex gap-1.5 text-muted-foreground">
                  <MapPinIcon className="size-3.5 mt-0.5 shrink-0" />
                  <p className="text-xs">{endereco}</p>
                </div>
              )}
              <Link
                href={`/beneficiarios/${b.id}`}
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
                  {atendimento.setor.codigo} — {atendimento.setor.nome}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs">Serviço</p>
                <p className="font-medium">
                  {atendimento.servico.codigo} — {atendimento.servico.nome}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
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
                <p className="text-muted-foreground">
                  Nenhum servidor assumiu este atendimento.
                </p>
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
            <AlertDialogAction onClick={handleConcluirConfirm} disabled={isPending}>
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
            <AlertDialogAction onClick={handleAssumirConfirm} disabled={isPending}>
              Assumir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: trocar entrevistador */}
      <Dialog open={trocarDialogOpen} onOpenChange={setTrocarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar entrevistador</DialogTitle>
            <DialogDescription>
              Selecione o novo entrevistador responsável por este atendimento.
              {atendimento.servidor && (
                <span className="block mt-1">
                  Responsável atual: <strong>{atendimento.servidor.nome}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="novo-entrevistador">Novo entrevistador</Label>
            <Select
              value={novoServidorId || null}
              onValueChange={(v) => { if (v) setNovoServidorId(v); }}
              items={entrevistadorItems}
            >
              <SelectTrigger id="novo-entrevistador">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {entrevistadoresFiltrados.length === 0 ? (
                  <SelectItem value="-" disabled>
                    Nenhum entrevistador disponível
                  </SelectItem>
                ) : (
                  entrevistadoresFiltrados.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                      <span className="ml-1 text-xs text-muted-foreground capitalize">
                        ({e.role})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrocarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleTrocarEntrevistador}
              disabled={!novoServidorId || isPending}
            >
              {isPending ? "Salvando..." : "Confirmar troca"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
