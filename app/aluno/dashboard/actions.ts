"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function processCheckout(
  planId: string,
  memberId: string,
  amount: number,
  receiptBase64: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Não autorizado" };
  }

  try {
    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return { success: false, error: "Plano não encontrado" };

    // Criar o pagamento com status PENDING
    await prisma.payment.create({
      data: {
        memberId,
        amount,
        method: "PIX",
        status: "PENDING",
        receiptUrl: receiptBase64, // Idealmente faria upload pro S3, mas base64 resolve pra MVP
      },
    });

    // Se o membro não tem plano, ou quer trocar, a gente já atrela ao member
    // Mas o status permanece o atual (ou PENDING) até o admin aprovar
    await prisma.member.update({
      where: { id: memberId },
      data: { planId },
    });

    revalidatePath("/aluno/dashboard");
    revalidatePath("/admin/financeiro");
    revalidatePath("/admin/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao processar checkout:", error);
    return { success: false, error: "Erro interno no servidor" };
  }
}

import { generateDynamicPixFromBase, generatePixPayload } from "@/lib/pix";

export async function getPixData(amount: number, txId: string) {
  const basePayload = process.env.PIX_BASE_PAYLOAD;

  if (basePayload) {
    // Usa a chave PIX Copia e Cola fornecida e injeta o valor dinamicamente
    const payload = generateDynamicPixFromBase(basePayload, amount);
    return { payload };
  }

  // Fallback caso não tenha PIX_BASE_PAYLOAD no .env (gera a partir da chave)
  const pixKey = process.env.PIX_KEY || "82987894552";
  const name = process.env.PIX_MERCHANT_NAME || "PORTOFIT SERTAO";
  const city = process.env.PIX_MERCHANT_CITY || "PAO DE ACUCAR";

  const payload = generatePixPayload({
    pixKey,
    amount,
    merchantName: name,
    merchantCity: city,
    txId: txId.substring(0, 25),
    description: "Pagamento PortoFit",
  });

  return { payload };
}
