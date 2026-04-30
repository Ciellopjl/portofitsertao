"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2, Download } from "lucide-react";

interface MemberRow {
  codigo: string;
  nome: string;
  email: string;
  plano: string;
  status: string;
  vencimento: string;
  totalPago: number;
  ultimoPagamento: string;
  cadastradoEm: string;
}

export default function ExportButtons() {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const fetchData = async (): Promise<MemberRow[]> => {
    const res = await fetch("/api/admin/alunos/export");
    if (!res.ok) throw new Error("Erro ao buscar dados");
    return res.json();
  };

  const exportExcel = async () => {
    setLoadingExcel(true);
    try {
      const data = await fetchData();
      const XLSX = await import("xlsx");

      const headers = [
        "Código", "Nome", "Email", "Plano", "Status",
        "Vencimento", "Total Pago (R$)", "Último Pagamento", "Cadastrado Em"
      ];

      const rows = data.map((d) => [
        d.codigo, d.nome, d.email, d.plano, d.status,
        d.vencimento,
        d.totalPago.toFixed(2).replace(".", ","),
        d.ultimoPagamento,
        d.cadastradoEm,
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Column widths
      ws["!cols"] = [
        { wch: 8 }, { wch: 30 }, { wch: 35 }, { wch: 18 }, { wch: 12 },
        { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
      ];

      // Header style
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cell]) continue;
        ws[cell].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "111111" } },
          alignment: { horizontal: "center" },
        };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alunos PortoFit");

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
      XLSX.writeFile(wb, `PortoFit_Alunos_${date}.xlsx`);
    } catch (e) {
      alert("Erro ao exportar Excel. Tente novamente.");
      console.error(e);
    } finally {
      setLoadingExcel(false);
    }
  };

  const exportPdf = async () => {
    setLoadingPdf(true);
    try {
      const res = await fetch("/api/admin/alunos/pdf");
      if (!res.ok) throw new Error("Erro ao gerar PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PortoFit_Alunos_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao exportar PDF. Tente novamente.");
      console.error(e);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportExcel}
        disabled={loadingExcel || loadingPdf}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exportar para Excel (.xlsx)"
      >
        {loadingExcel
          ? <Loader2 size={16} className="animate-spin" />
          : <FileSpreadsheet size={16} />
        }
        <span className="hidden sm:inline">{loadingExcel ? "Gerando..." : "Excel"}</span>
      </button>

      <button
        onClick={exportPdf}
        disabled={loadingExcel || loadingPdf}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Exportar para PDF"
      >
        {loadingPdf
          ? <Loader2 size={16} className="animate-spin" />
          : <FileText size={16} />
        }
        <span className="hidden sm:inline">{loadingPdf ? "Gerando..." : "PDF"}</span>
      </button>
    </div>
  );
}
