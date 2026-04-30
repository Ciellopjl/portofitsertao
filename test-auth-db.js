const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Testando conexão com a tabela AuthorizedAdmin...");
  try {
    const test = await prisma.authorizedAdmin.findMany();
    console.log("✅ Tabela encontrada! Total de registros:", test.length);
    
    // Tenta criar um registro de teste e apagar em seguida
    const created = await prisma.authorizedAdmin.create({
      data: { email: 'teste-tecnico@portofit.com', name: 'Teste do Sistema' }
    });
    console.log("✅ Escrita permitida com sucesso!");
    
    await prisma.authorizedAdmin.delete({ where: { id: created.id } });
    console.log("✅ Limpeza de teste concluída!");
  } catch (e) {
    console.error("❌ ERRO NO BANCO:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
