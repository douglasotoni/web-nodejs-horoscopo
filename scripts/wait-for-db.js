#!/usr/bin/env node
// Aguarda o PostgreSQL estar pronto para aceitar conexões

const { execSync } = require('child_process');

const maxAttempts = 30;
const delayMs = 2000;

function tryConnect() {
  try {
    // Tenta conectar usando o Prisma Client (já gerado)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    return prisma.$queryRaw`SELECT 1`
      .then(() => {
        console.log('✅ PostgreSQL está pronto!');
        prisma.$disconnect();
        return true;
      })
      .catch(() => {
        prisma.$disconnect();
        return false;
      });
  } catch (error) {
    return false;
  }
}

async function waitForDatabase() {
  console.log('⏳ Aguardando PostgreSQL ficar disponível...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const connected = await tryConnect();
    if (connected) {
      process.exit(0);
    }
    
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('❌ Timeout: PostgreSQL não ficou disponível após', maxAttempts * delayMs / 1000, 'segundos');
  process.exit(1);
}

waitForDatabase();
