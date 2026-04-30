"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordCheckIn(studentCode: string) {
  try {
    // 1. Buscar o membro pelo código de 4 dígitos
    const member = await prisma.member.findUnique({
      where: { studentCode },
      include: { 
        user: true,
        plan: true
      }
    });

    if (!member) {
      return { success: false, error: "Aluno não encontrado. Verifique o código." };
    }

    // 2. Verificar status do plano
    const now = new Date();
    const isExpired = member.planExpiresAt && new Date(member.planExpiresAt) < now;
    const isNearExpiration = member.planExpiresAt && !isExpired && 
      (new Date(member.planExpiresAt).getTime() - now.getTime()) < (5 * 24 * 60 * 60 * 1000); // 5 dias

    // 3. Registrar o Check-in
    await prisma.checkIn.create({
      data: {
        memberId: member.id
      }
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      student: {
        name: member.user.name,
        image: member.user.image,
        plan: member.plan?.name || "Sem Plano",
        expiresAt: member.planExpiresAt?.toLocaleDateString('pt-BR'),
        status: member.status,
        isExpired,
        isNearExpiration
      }
    };
  } catch (error) {
    console.error("Erro no Check-in:", error);
    return { success: false, error: "Falha ao registrar presença." };
  }
}
