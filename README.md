# Horóscopo por Signo Solar

Sistema web de previsões astrológicas desenvolvido com Next.js, TypeScript, PostgreSQL e Prisma.

## 🚀 Tecnologias

- Next.js 14, TypeScript, PostgreSQL, Prisma, NextAuth

## 📦 Instalação e Execução com Docker

### 1. Subir os containers

```bash
docker-compose up -d
```

Isso inicia:
- PostgreSQL na porta `5432`
- Aplicação Next.js na porta `3000`

### 2. Executar migrations e seed

```bash
# Aplicar migrations (criar tabelas)
docker exec -it web_reactjs_horoscopo npx prisma migrate deploy

# Popular banco com dados iniciais
docker exec -it web_reactjs_horoscopo npx tsx prisma/seed-zodiac.ts
```

### 3. Acessar a aplicação

Abra no navegador: `http://localhost:3000`

## 🔐 Credenciais Padrão

- **Admin**: `admin@horoscopo.com` / `admin123`
- **Editor**: `editor@horoscopo.com` / `editor123`
- **Viewer**: `viewer@horoscopo.com` / `viewer123`

## 🛠️ Comandos Úteis

```bash
# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f web

# Resetar banco e migrations
docker exec -it web_reactjs_horoscopo npx prisma migrate reset

# Abrir Prisma Studio
docker exec -it web_reactjs_horoscopo npx prisma studio
```

## 📁 Estrutura Principal

```
app/
├── api/              # APIs (auth, predictions, admin)
├── admin/            # Páginas administrativas
├── dashboard/        # Dashboard
└── predictions/      # Consulta de previsões
prisma/
├── schema.prisma     # Schema do banco
├── seed.ts          # Seed principal
└── seed-zodiac.ts   # Seed de dados astrológicos
```

## 🔄 Resetar Tudo

Para recriar o banco do zero:

```bash
# 1. Parar containers
docker-compose down

# 2. Remover volume do banco (opcional - apaga dados)
docker volume rm web-reactjs-horoscopo_pgdata

# 3. Subir novamente
docker-compose up -d

# 4. Aplicar migrations e seed
docker exec -it web_reactjs_horoscopo npx prisma migrate deploy
docker exec -it web_reactjs_horoscopo npx tsx prisma/seed-zodiac.ts
```
