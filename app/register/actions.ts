"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  console.log("Iniciando cadastro via RAW SQL para:", email);

  if (!name || !email || !password || !phone) {
    return { error: "Todos os campos são obrigatórios" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Este email já está cadastrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `u_${Math.random().toString(36).substring(2, 15)}`;

    // 1. Criar Usuário via SQL para ignorar cache de tipos
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, name, email, password, role, "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      userId, name, email, hashedPassword, "STUDENT"
    );

    // 2. Gerar Próximo Código de Aluno de forma Robusta (Senior)
    // Buscamos todos para garantir que pegamos o maior número real
    const allMembers = await prisma.member.findMany({
      select: { studentCode: true }
    });
    
    const codes = allMembers
      .map((m: any) => parseInt(m.studentCode))
      .filter((n: number) => !isNaN(n));
      
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    const nextCode = String(nextNum).padStart(4, "0");

    // 3. Criar Perfil de Membro
    await prisma.member.create({
      data: {
        userId: userId,
        studentCode: nextCode,
        phone: phone,
        status: "PENDING",
      },
    });

    // Criar Notificação para o Sistema (Admin Ver)
    await prisma.notification.create({
      data: {
        userId: userId,
        type: "SYSTEM",
        title: "Novo Auto-Cadastro",
        message: `${name} acabou de se cadastrar pelo site.`,
      }
    });

    console.log("Cadastro Finalizado com Sucesso para:", email, "Código:", nextCode);
    return { success: true };

  } catch (e: unknown) {
    const error = e as Error;
    console.error("ERRO NO CADASTRO FINAL:", error);
    // Se for erro de e-mail duplicado no SQL (23505 no Postgres)
    if (error.message?.includes('unique constraint') || error.message?.includes('23505')) {
      return { error: "Este e-mail já está em uso." };
    }
    return { error: `Erro no servidor: ${error.message}` };
  }
}
