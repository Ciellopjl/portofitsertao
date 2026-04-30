require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const res = await client.query("SELECT enum_range(NULL::\"Role\")");
  console.log('DB ENUM Role:', res.rows);
  
  const users = await client.query("SELECT id, role FROM \"User\"");
  console.log('Users Roles:', users.rows);
  await client.end();
}
main().catch(console.error);
