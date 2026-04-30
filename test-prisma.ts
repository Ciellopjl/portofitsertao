import { prisma } from './lib/prisma'

async function test() {
  try {
    console.log('🚀 Testando criação de usuário via SQL DIRETO...')
    const userId = `u_${Date.now()}`;
    
    // Escreve direto no banco, ignorando o cache de tipos do VS Code
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, name, email, password, role, "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      userId, 'Teste Sênior', `test_${Date.now()}@test.com`, '123456', 'STUDENT'
    );
    
    console.log('✅ Usuário criado com sucesso via SQL!');
  } catch (e: any) {
    console.error('❌ ERRO NO TESTE:', e.message);
  } finally {
    process.exit(0);
  }
}

test();
