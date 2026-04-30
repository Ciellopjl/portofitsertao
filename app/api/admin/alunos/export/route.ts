import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      payments: { where: { status: "PAID" }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { studentCode: "asc" },
  });

  const data = (members as any[]).map((m: any) => ({
    codigo: m.studentCode,
    nome: m.user.name || "—",
    email: m.user.email || "—",
    plano: m.plan?.name || "Sem Plano",
    status: m.status === "ACTIVE" ? "Ativo" : m.status === "PENDING" ? "Pendente" : "Inativo",
    vencimento: m.planExpiresAt
      ? new Date(m.planExpiresAt).toLocaleDateString("pt-BR")
      : "—",
    totalPago: m.payments.reduce((acc: number, p: any) => acc + p.amount, 0),
    ultimoPagamento: m.payments[0]
      ? new Date(m.payments[0].createdAt).toLocaleDateString("pt-BR")
      : "—",
    cadastradoEm: new Date(m.createdAt).toLocaleDateString("pt-BR"),
  }));

  return NextResponse.json(data);
}
