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
});

interface RelatorioPDFProps {
  atendimentos: Atendimento[];
  filtroDesc?: string;
}

export function RelatorioPDF({ atendimentos, filtroDesc }: RelatorioPDFProps) {
  const geradoEm = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

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
