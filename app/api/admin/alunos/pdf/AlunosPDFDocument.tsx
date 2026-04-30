import {
  Document, Page, Text, View, StyleSheet, Font
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [],
});

const gold = "#FFD700";
const dark = "#0a0a0a";
const darkCard = "#141414";
const darkRow = "#111111";
const altRow = "#161616";
const border = "#252525";
const muted = "#777777";
const white = "#FFFFFF";
const green = "#4ade80";
const yellow = "#facc15";
const red = "#f87171";

const styles = StyleSheet.create({
  page: {
    backgroundColor: dark,
    paddingBottom: 40,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#000000",
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: gold,
  },
  headerLeft: {},
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  brandDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: gold,
  },
  brandText: { color: gold, fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  subtitle: { color: muted, fontSize: 9, letterSpacing: 1 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { color: muted, fontSize: 8 },
  headerTitle: { color: white, fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },

  statsBar: {
    backgroundColor: darkCard,
    flexDirection: "row",
    paddingHorizontal: 32,
    paddingVertical: 12,
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: border,
  },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: white, marginBottom: 2 },
  statLabel: { fontSize: 7, color: muted, letterSpacing: 0.5, textTransform: "uppercase" },
  statGold: { color: gold },
  statGreen: { color: green },
  statYellow: { color: yellow },
  statRed: { color: red },

  body: { paddingHorizontal: 24, paddingTop: 20 },
  sectionTitle: {
    color: muted,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: gold,
    paddingLeft: 8,
  },

  table: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: border,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#0d0d0d",
    borderBottomWidth: 1,
    borderBottomColor: gold + "55",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeadCell: {
    color: gold,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: border,
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: altRow },
  tableCell: {
    color: "#cccccc",
    fontSize: 8,
    paddingHorizontal: 6,
  },
  tableCellMono: {
    color: gold,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: border,
    paddingTop: 8,
  },
  footerText: { color: "#444444", fontSize: 7 },
});

interface MemberRow {
  codigo: string;
  nome: string;
  email: string;
  plano: string;
  status: string;
  vencimento: string;
  totalPago: number;
  cadastradoEm: string;
}

interface Stats {
  total: number;
  ativos: number;
  pendentes: number;
  inativos: number;
  receita: number;
  geradoEm: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    ACTIVE:   { bg: green + "20",  color: green,  label: "Ativo" },
    PENDING:  { bg: yellow + "20", color: yellow, label: "Pendente" },
    INACTIVE: { bg: red + "20",    color: red,    label: "Inativo" },
  };
  const c = config[status] || config.INACTIVE;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

// Column widths (must sum to ~100%)
const COL = {
  code:   "6%",
  nome:   "18%",
  email:  "22%",
  plano:  "14%",
  status: "9%",
  venc:   "11%",
  total:  "11%",
  data:   "9%",
};

export default function AlunosPDFDocument({
  members,
  stats,
}: {
  members: MemberRow[];
  stats: Stats;
}) {
  return (
    <Document
      title="Relatório de Alunos – PortoFit Sertão"
      author="PortoFit Sertão"
      creator="Admin Panel"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>PORTOFIT SERTÃO</Text>
            </View>
            <Text style={styles.subtitle}>ADMIN PANEL · RELATÓRIO OFICIAL</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>{stats.geradoEm}</Text>
            <Text style={styles.headerTitle}>Gestão de Alunos</Text>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statGold]}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total de Alunos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statGreen]}>{stats.ativos}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statYellow]}>{stats.pendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statRed]}>{stats.inativos}</Text>
            <Text style={styles.statLabel}>Inativos</Text>
          </View>
          <View style={[styles.statItem, { flex: 1.4 }]}>
            <Text style={[styles.statValue, styles.statGold, { fontSize: 14 }]}>
              R$ {stats.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.statLabel}>Receita Total Confirmada</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Lista de Membros</Text>
          <View style={styles.table}>
            {/* Head */}
            <View style={styles.tableHead}>
              <Text style={[styles.tableHeadCell, { width: COL.code }]}>#</Text>
              <Text style={[styles.tableHeadCell, { width: COL.nome }]}>Nome</Text>
              <Text style={[styles.tableHeadCell, { width: COL.email }]}>Email</Text>
              <Text style={[styles.tableHeadCell, { width: COL.plano }]}>Plano</Text>
              <Text style={[styles.tableHeadCell, { width: COL.status }]}>Status</Text>
              <Text style={[styles.tableHeadCell, { width: COL.venc }]}>Vencimento</Text>
              <Text style={[styles.tableHeadCell, { width: COL.total }]}>Total Pago</Text>
              <Text style={[styles.tableHeadCell, { width: COL.data }]}>Cadastro</Text>
            </View>

            {/* Rows */}
            {members.map((m, i) => (
              <View key={m.codigo} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCellMono, { width: COL.code }]}>{m.codigo}</Text>
                <Text style={[styles.tableCell, { width: COL.nome, color: white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }]}>{m.nome}</Text>
                <Text style={[styles.tableCell, { width: COL.email, fontSize: 7, color: "#999" }]}>{m.email}</Text>
                <Text style={[styles.tableCell, { width: COL.plano, fontSize: 7.5 }]}>{m.plano}</Text>
                <View style={{ width: COL.status, paddingHorizontal: 6 }}>
                  <StatusBadge status={m.status} />
                </View>
                <Text style={[styles.tableCell, { width: COL.venc, fontSize: 7.5 }]}>{m.vencimento}</Text>
                <Text style={[styles.tableCell, { width: COL.total, color: m.totalPago > 0 ? green : muted, fontFamily: "Helvetica-Bold", fontSize: 7.5 }]}>
                  R$ {m.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.tableCell, { width: COL.data, fontSize: 7 }]}>{m.cadastradoEm}</Text>
              </View>
            ))}

            {members.length === 0 && (
              <View style={[styles.tableRow, { justifyContent: "center", paddingVertical: 24 }]}>
                <Text style={{ color: muted, fontSize: 10 }}>Nenhum aluno cadastrado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            PortoFit Sertão · Documento Confidencial · {stats.geradoEm}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
