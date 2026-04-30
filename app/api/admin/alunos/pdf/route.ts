import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import AlunosPDFDocument from "./AlunosPDFDocument";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    where: { user: { role: { not: "ADMIN" } } },
    include: {
      user: true,
      plan: true,
      payments: { where: { status: "PAID" } },
    },
    orderBy: { studentCode: "asc" },
  });

  const data = members.map((m) => ({
    codigo: m.studentCode,
    nome: m.user.name || "—",
    email: m.user.email || "—",
    plano: m.plan?.name || "Sem Plano",
    status: m.status,
    vencimento: m.planExpiresAt
      ? new Date(m.planExpiresAt).toLocaleDateString("pt-BR")
      : "—",
    totalPago: m.payments.reduce((acc, p) => acc + p.amount, 0),
    cadastradoEm: new Date(m.createdAt).toLocaleDateString("pt-BR"),
  }));

  const stats = {
    total: data.length,
    ativos: data.filter((d) => d.status === "ACTIVE").length,
    pendentes: data.filter((d) => d.status === "PENDING").length,
    inativos: data.filter((d) => d.status === "INACTIVE").length,
    receita: data.reduce((acc, d) => acc + d.totalPago, 0),
    geradoEm: new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
  };

  const pdfBuffer = await renderToBuffer(
    createElement(AlunosPDFDocument, { members: data, stats }) as any
  );

  return new NextResponse(pdfBuffer as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="PortoFit_Alunos_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf"`,
    },
  });
}
