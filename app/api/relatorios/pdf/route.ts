import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { getRelatoriosCompleto } from "@/app/(app)/relatorios/actions";
import { RelatorioPDF } from "@/components/relatorios/relatorio-pdf";
import { getCurrentUser } from "@/lib/supabase/auth";
import { format } from "date-fns";

const PDF_MAX_ROWS = 5000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Rate limit: 10 requisições por janela de 60 segundos por usuário
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Não autorizado", { status: 401 });
  }

  if (user.role === "recepcionista") {
    return new Response("Acesso negado", { status: 403 });
  }

  const { allowed, retryAfterMs } = checkRateLimit(user.id);
  if (!allowed) {
    return new Response("Muitas requisições. Aguarde antes de exportar novamente.", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const sp = request.nextUrl.searchParams;

  const deRaw = sp.get("de") || "";
  const ateRaw = sp.get("ate") || "";

  const filtros = {
    busca: sp.get("busca") || "",
    setorId: sp.get("setor") || "",
    servicoId: sp.get("servico") || "",
    statusId: sp.get("status") || "",
    servidorId: sp.get("servidor") || "",
    prioridade: sp.get("prioridade") || "",
    dataInicio: ISO_DATE.test(deRaw) ? deRaw : "",
    dataFim: ISO_DATE.test(ateRaw) ? ateRaw : "",
  };

  const atendimentos = await getRelatoriosCompleto(filtros);

  if (atendimentos.length >= PDF_MAX_ROWS) {
    return new Response(
      `O relatório excede ${PDF_MAX_ROWS} registros. Aplique filtros de data, setor ou servidor para reduzir o resultado antes de exportar.`,
      { status: 413, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const partes: string[] = [];
  if (filtros.dataInicio || filtros.dataFim) {
    partes.push(`${filtros.dataInicio || "início"} a ${filtros.dataFim || "hoje"}`);
  }
  if (filtros.prioridade === "sim") partes.push("Prioritários");
  if (filtros.prioridade === "nao") partes.push("Normais");
  const filtroDesc = partes.length > 0 ? partes.join(", ") : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(RelatorioPDF, { atendimentos, filtroDesc }) as any;
  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  const nomeArquivo = `relatorio-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Content-Length": String(uint8.byteLength),
    },
  });
}
