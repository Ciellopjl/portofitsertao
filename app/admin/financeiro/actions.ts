"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePayment(paymentId: string) {
  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date() },
    });

    const payment = await prisma.payment.findUnique({ 
      where: { id: paymentId },
      include: { member: { include: { plan: true } } }
    });

    if (payment && payment.member.plan) {
      const currentExpiresAt = payment.member.planExpiresAt;
      const now = new Date();
      
      // Se já tem um vencimento no futuro, soma a partir dele. Se não, soma a partir de hoje.
      const baseDate = (currentExpiresAt && currentExpiresAt > now) ? new Date(currentExpiresAt) : now;
      
      // Adiciona a duração do plano em meses
      const newExpiresAt = new Date(baseDate);
      newExpiresAt.setMonth(newExpiresAt.getMonth() + payment.member.plan.duration);

      await prisma.member.update({
        where: { id: payment.memberId },
        data: { 
          status: "ACTIVE",
          planExpiresAt: newExpiresAt
        },
      });
    } else if (payment) {
      // Se não tem plano atrelado por algum motivo
      await prisma.member.update({
        where: { id: payment.memberId },
        data: { status: "ACTIVE" },
      });
    }

    revalidatePath("/admin/financeiro");
    revalidatePath("/admin/alunos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao aprovar pagamento." };
  }
}

import { verifyReceipt } from "@/lib/ai-verify";

export async function analyzeReceiptAI(paymentId: string, imageUrl: string) {
  try {
    const result = await verifyReceipt(imageUrl);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: "Erro ao analisar com IA." };
  }
}

export async function rejectPayment(paymentId: string) {
  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/admin/financeiro");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao recusar pagamento." };
  }
}
