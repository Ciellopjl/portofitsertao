"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteMember(memberId: string) {
  try {
    const member = await prisma.member.findUnique({ 
      where: { id: memberId },
      include: { user: true }
    });

    if (!member) return { success: false, error: "Aluno não encontrado." };

    // Deletamos o usuário diretamente. O Cascade Delete no banco cuidará de:
    // - Member (vinculado ao userId)
    // - Accounts (Google/GitHub vinculados ao userId)
    // - Sessions (Sessões ativas vinculadas ao userId)
    // - Payments (vinculados ao memberId que será removido via User->Member cascade)
    await prisma.user.delete({
      where: { id: member.userId }
    });

    revalidatePath("/admin/alunos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/aluno/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete member", error);
    return { success: false, error: "Falha ao remover aluno. O usuário pode ter registros pendentes." };
  }
}

export async function createAluno(data: {
  name: string;
  email: string;
  phone: string;
  planId: string;
  status: string;
}) {
  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "Já existe um usuário com este email." };
    }

    // Generate a unique 4-digit student code
    const lastMember = await prisma.member.findFirst({
      orderBy: { studentCode: "desc" },
    });
    const nextCode = String(
      (parseInt(lastMember?.studentCode || "0") + 1)
    ).padStart(4, "0");

    // Compute plan expiry
    let planExpiresAt: Date | null = null;
    if (data.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
      if (plan) {
        planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + plan.duration);
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: "ALUNO",
        member: {
          create: {
            studentCode: nextCode,
            status: data.status as any,
            phone: data.phone,
            planId: data.planId || null,
            planExpiresAt,
          },
        },
      },
    });

    // Criar Notificação para o Sistema
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: "SYSTEM",
        title: "Novo Aluno",
        message: `${data.name} foi cadastrado manualmente pelo administrador.`,
      }
    });

    revalidatePath("/admin/alunos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Erro interno ao criar aluno." };
  }
}

export async function getMemberWorkouts(memberId: string) {
  return await prisma.workout.findMany({
    where: { memberId },
    include: { exercises: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveWorkout(memberId: string, data: {
  name: string;
  description?: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    rest?: string;
    notes?: string;
  }[];
}) {
  try {
    // Desativamos treinos anteriores para manter apenas o novo como principal
    await prisma.workout.updateMany({
      where: { memberId },
      data: { isActive: false }
    });

    const workout = await prisma.workout.create({
      data: {
        memberId,
        name: data.name,
        description: data.description,
        isActive: true,
        exercises: {
          create: data.exercises.map((ex, index) => ({
            ...ex,
            order: index
          }))
        }
      }
    });

    revalidatePath("/admin/alunos");
    revalidatePath("/aluno/treino");
    return { success: true, workout };
  } catch (error) {
    console.error("Failed to save workout", error);
    return { success: false, error: "Erro ao salvar treino." };
  }
}

export async function recordCheckIn(qrValue: string) {
  try {
    // Formato do QR: PORTOFIT-CODE-ID
    const parts = qrValue.split("-");
    if (parts.length < 3 || parts[0] !== "PORTOFIT") {
      return { success: false, error: "QR Code inválido ou de outra academia." };
    }

    const memberId = parts[2];

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, plan: true }
    });

    if (!member) return { success: false, error: "Aluno não encontrado." };

    if (member.status !== "ACTIVE") {
      return { 
        success: false, 
        error: `Acesso Negado: Status ${member.status}`,
        studentName: member.user.name 
      };
    }

    // Registrar o Check-in
    await prisma.checkIn.create({
      data: { memberId: member.id }
    });

    return { 
      success: true, 
      studentName: member.user.name,
      planName: member.plan?.name || "Sem Plano"
    };
  } catch (error) {
    return { success: false, error: "Erro ao processar check-in." };
  }
}

export async function getNotifications() {
  try {
    // Vamos buscar as notificações reais da tabela Notification
    const notifications = await prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: "Falha ao carregar notificações." };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao limpar notificações." };
  }
}
