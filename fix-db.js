require('dotenv').config();
const { Client } = require('pg');

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Conectado ao banco!');
    
    // 1. Garantir que a coluna password existe
    console.log('Verificando/Adicionando coluna password...');
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT');
    
    // 2. Garantir que a coluna role existe (por segurança)
    console.log('Verificando/Adicionando coluna role...');
    // Se falhar porque já existe o tipo, tudo bem
    try {
        await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT \'STUDENT\'');
    } catch(e) {}

    console.log('✅ Banco de dados atualizado com sucesso!');
  } catch (e) {
    console.error('❌ ERRO AO ATUALIZAR:', e.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fix();
