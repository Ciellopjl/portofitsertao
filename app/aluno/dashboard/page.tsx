import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import StudentDashboardClient from "./StudentDashboardClient";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      member: {
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  // If user is ADMIN, redirect to admin dashboard
  if (user.role === "ADMIN") redirect("/admin/dashboard");

  // If user doesn't have a member record yet, create one (Fail-safe)
  if (!user.member) {
    console.log("🛠️ Aluno sem perfil de membro. Criando agora...");
    
    // Pegamos todos os códigos existentes para achar o maior real
    const allMembers = await prisma.member.findMany({ select: { studentCode: true } });
    const codes = allMembers.map((m: any) => parseInt(m.studentCode)).filter((n: number) => !isNaN(n));
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    const nextCode = String(nextNum).padStart(4, "0");

    await prisma.member.create({
      data: {
        userId: user.id,
        studentCode: nextCode,
        status: "PENDING",
      },
    });
    
    // O redirect já cuida de atualizar o estado na próxima carga
    redirect("/aluno/dashboard");
  }

  // Se o aluno já não tinha member, criamos agora, e agora vamos buscar todos os planos ativos para exibição
  const activePlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  return (
    <StudentDashboardClient
      user={{
        name: user.name || "Aluno",
        email: user.email || "",
        image: user.image || null,
      }}
      member={{
        id: user.member.id,
        studentCode: user.member.studentCode,
        status: user.member.status,
        planExpiresAt: user.member.planExpiresAt?.toISOString() || null,
        plan: user.member.plan ? {
          id: user.member.plan.id,
          name: user.member.plan.name,
          price: user.member.plan.price,
        } : null,
        payments: user.member.payments.map((p: any) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          method: p.method,
          createdAt: p.createdAt.toISOString(),
        })),
      }}
      plans={activePlans.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: p.price,
        duration: p.duration,
        features: p.features,
      }))}
    />
  );
}
