"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(data: {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}) {
  try {
    await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: data.price,
        duration: data.duration,
        features: data.features,
        isActive: true,
      },
    });
    revalidatePath("/admin/planos");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro interno ao criar plano." };
  }
}

export async function updatePlan(id: string, data: {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}) {
  try {
    await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || "",
        price: data.price,
        duration: data.duration,
        features: data.features,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/planos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro interno ao atualizar plano." };
  }
}

export async function deletePlan(planId: string) {
  try {
    await prisma.plan.delete({ where: { id: planId } });
    revalidatePath("/admin/planos");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro ao deletar plano." };
  }
}
