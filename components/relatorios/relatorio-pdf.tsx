import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Atendimento } from "@/lib/types";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    color: "#111827",
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  subtitulo: {
    fontSize: 8,
    color: "#6b7280",
  },
  tabela: {
    marginTop: 8,
  },
  cabecalho: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  cabecalhoCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  linha: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  linhaAlternada: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    fontSize: 8,
    color: "#374151",
  },
  badge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 7,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
  // Larguras das colunas (soma = 100%)
  colBeneficiario: { width: "22%" },
  colCpf:          { width: "10%" },
  colSetor:        { width: "12%" },
  colServico:      { width: "14%" },
  colStatus:       { width: "10%" },
  colServidor:     { width: "12%" },
  colPrioridade:   { width: "8%" },
  colData:         { width: "12%" },
  // Totalizadores
  totSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  totTitulo: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: "#111827",
  },
  totGrid: {
    flexDirection: "row",
    gap: 8,
  },
  totCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 8,
  },
  totCardTitulo: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  totLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totLabel: {
    fontSize: 8,
    color: "#374151",
    flex: 1,
  },
  totValor: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginLeft: 4,
  },
  totDestaque: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  totDestaqueLabel: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 2,
  },
});

interface RelatorioPDFProps {
  atendimentos: Atendimento[];
  filtroDesc?: string;
}

function contarPor<T>(items: T[], key: (item: T) => string): { nome: string; total: number }[] {
  const mapa = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return Array.from(mapa.entries())
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);
}

export function RelatorioPDF({ atendimentos, filtroDesc }: RelatorioPDFProps) {
  const geradoEm = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  const total = atendimentos.length;
  const prioritarios = atendimentos.filter((a) => a.prioritario).length;
  const concluidos = atendimentos.filter((a) => a.concluido_em).length;
  const emAberto = total - concluidos;

  const porStatus = contarPor(atendimentos, (a) => a.status?.nome ?? "—");
  const porSetor = contarPor(atendimentos, (a) => a.setor?.nome ?? "—");
  const porServico = contarPor(atendimentos, (a) => a.servico?.nome ?? "—");

  return (
    <Document
      title="Relatório de Atendimentos — E-CAD"
      author="E-CAD / Secretaria de Assistência Social"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Relatório de Atendimentos — E-CAD</Text>
          <Text style={styles.subtitulo}>
            {filtroDesc ? `Filtros: ${filtroDesc} · ` : ""}
            {atendimentos.length} registro{atendimentos.length !== 1 ? "s" : ""} · Gerado em {geradoEm}
          </Text>
        </View>

        {/* Tabela */}
        <View style={styles.tabela}>
          {/* Cabeçalho da tabela */}
          <View style={styles.cabecalho}>
            <Text style={[styles.cabecalhoCell, styles.colBeneficiario]}>Beneficiário</Text>
            <Text style={[styles.cabecalhoCell, styles.colCpf]}>CPF</Text>
            <Text style={[styles.cabecalhoCell, styles.colSetor]}>Setor</Text>
            <Text style={[styles.cabecalhoCell, styles.colServico]}>Serviço</Text>
            <Text style={[styles.cabecalhoCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.cabecalhoCell, styles.colServidor]}>Servidor</Text>
            <Text style={[styles.cabecalhoCell, styles.colPrioridade]}>Prioridade</Text>
            <Text style={[styles.cabecalhoCell, styles.colData]}>Data</Text>
          </View>

          {/* Linhas */}
          {atendimentos.map((a, i) => (
            <View
              key={a.id}
              style={[styles.linha, i % 2 !== 0 ? styles.linhaAlternada : {}]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colBeneficiario]}>
                {a.beneficiario?.nome ?? "—"}
              </Text>
              <Text style={[styles.cell, styles.colCpf]}>
                {a.beneficiario?.cpf ?? ""}
              </Text>
              <Text style={[styles.cell, styles.colSetor]}>
                {a.setor?.nome ?? "—"}
              </Text>
              <Text style={[styles.cell, styles.colServico]}>
                {a.servico?.nome ?? "—"}
              </Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {a.status?.nome ?? "—"}
              </Text>
              <Text style={[styles.cell, styles.colServidor]}>
                {a.servidor?.nome ?? "—"}
              </Text>
              <Text style={[styles.cell, styles.colPrioridade]}>
                {a.prioritario ? "Prioritário" : "Normal"}
              </Text>
              <Text style={[styles.cell, styles.colData]}>
                {format(new Date(a.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </Text>
            </View>
          ))}
        </View>

        {/* Totalizadores */}
        <View style={styles.totSection} wrap={false}>
          <Text style={styles.totTitulo}>Totalizadores</Text>
          <View style={styles.totGrid}>

            {/* Card: Resumo geral */}
            <View style={styles.totCard}>
              <Text style={styles.totCardTitulo}>Resumo Geral</Text>
              <Text style={styles.totDestaque}>{total}</Text>
              <Text style={styles.totDestaqueLabel}>atendimento{total !== 1 ? "s" : ""}</Text>
              <View style={{ marginTop: 8 }}>
                <View style={styles.totLinha}>
                  <Text style={styles.totLabel}>Concluídos</Text>
                  <Text style={styles.totValor}>{concluidos}</Text>
                </View>
                <View style={styles.totLinha}>
                  <Text style={styles.totLabel}>Em aberto</Text>
                  <Text style={styles.totValor}>{emAberto}</Text>
                </View>
                <View style={styles.totLinha}>
                  <Text style={styles.totLabel}>Prioritários</Text>
                  <Text style={styles.totValor}>{prioritarios}</Text>
                </View>
                <View style={styles.totLinha}>
                  <Text style={styles.totLabel}>Normais</Text>
                  <Text style={styles.totValor}>{total - prioritarios}</Text>
                </View>
              </View>
            </View>

            {/* Card: Por status */}
            <View style={styles.totCard}>
              <Text style={styles.totCardTitulo}>Por Status</Text>
              {porStatus.map((s) => (
                <View key={s.nome} style={styles.totLinha}>
                  <Text style={styles.totLabel}>{s.nome}</Text>
                  <Text style={styles.totValor}>{s.total}</Text>
                </View>
              ))}
            </View>

            {/* Card: Por setor */}
            <View style={styles.totCard}>
              <Text style={styles.totCardTitulo}>Por Setor</Text>
              {porSetor.map((s) => (
                <View key={s.nome} style={styles.totLinha}>
                  <Text style={styles.totLabel}>{s.nome}</Text>
                  <Text style={styles.totValor}>{s.total}</Text>
                </View>
              ))}
            </View>

            {/* Card: Por serviço */}
            <View style={styles.totCard}>
              <Text style={styles.totCardTitulo}>Por Serviço</Text>
              {porServico.map((s) => (
                <View key={s.nome} style={styles.totLinha}>
                  <Text style={styles.totLabel}>{s.nome}</Text>
                  <Text style={styles.totValor}>{s.total}</Text>
                </View>
              ))}
            </View>

          </View>
        </View>

        {/* Rodapé com paginação */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>E-CAD — Secretaria de Assistência Social de Caarapo/MS</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
