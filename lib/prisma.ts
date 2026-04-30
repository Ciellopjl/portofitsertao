import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  console.log("🛠️ Criando nova instância do Prisma Client...");
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10, // Limite de conexões para não estourar o Neon
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

  pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool do Postgres:', err)
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ 
    adapter,
    log: ['error', 'warn']
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
