"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAuthorizedAdmins() {
  try {
    // SQL Puro com JOIN: Busca o e-mail autorizado + o status 'lastSeen' do usuário
    const data = await prisma.$queryRaw<any[]>`
      SELECT 
        a.id, 
        a.email, 
        a.name, 
        a."createdAt",
        u."lastSeen",
        u.image
      FROM "AuthorizedAdmin" a
      LEFT JOIN "User" u ON LOWER(a.email) = LOWER(u.email)
      ORDER BY a."createdAt" DESC
    `;
    return { success: true, data };
  } catch (error) {
    console.error("Erro na busca de acessos:", error);
    return { success: false, error: "Falha ao buscar autorizações." };
  }
}

export async function authorizeEmail(email: string, name?: string) {
  try {
    const emailLower = email.toLowerCase();
    
    // Verifica existência via SQL
    const exists = await prisma.$queryRaw<any[]>`SELECT id FROM "AuthorizedAdmin" WHERE email = ${emailLower} LIMIT 1`;

    if (exists.length > 0) {
      return { success: false, error: "Este e-mail já está autorizado." };
    }

    // Insere via SQL gerando um ID aleatório compatível com cuid/string
    const id = Math.random().toString(36).substring(2, 15);
    await prisma.$executeRaw`INSERT INTO "AuthorizedAdmin" (id, email, name, "createdAt") VALUES (${id}, ${emailLower}, ${name || null}, NOW())`;

    revalidatePath("/admin/liberacao");
    return { success: true };
  } catch (error) {
    console.error("ERRO CRÍTICO NA AUTORIZAÇÃO:", error);
    return { success: false, error: "Erro ao autorizar e-mail via banco de dados." };
  }
}

export async function removeAuthorization(id: string) {
  try {
    await prisma.$executeRaw`DELETE FROM "AuthorizedAdmin" WHERE id = ${id}`;
    revalidatePath("/admin/liberacao");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover autorização:", error);
    return { success: false, error: "Erro ao remover autorização." };
  }
}
