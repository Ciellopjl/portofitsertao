require('dotenv').config();
const { Client } = require('pg');

async function clean() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const email = 'pinngo@gmail.com';
    console.log(`Limpando dados para: ${email}`);
    
    await client.query('DELETE FROM "Member" WHERE "userId" IN (SELECT id FROM "User" WHERE email = $1)', [email]);
    await client.query('DELETE FROM "User" WHERE email = $1', [email]);
    
    console.log('✅ Dados limpos! Pode tentar o cadastro agora.');
  } catch (e) {
    console.error('❌ ERRO:', e.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

clean();
