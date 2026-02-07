# Horóscopo por Signo Solar

Sistema web de previsões astrológicas (diária e semanal), fases da lua e aniversariantes, desenvolvido com Next.js, TypeScript, PostgreSQL e Prisma.

## Tecnologias

- **Next.js 14** (App Router), **TypeScript**, **PostgreSQL**, **Prisma**

## Instalação e execução com Docker

### Subir a aplicação

```bash
docker compose up -d
```

Na primeira subida o container da aplicação:

- Instala dependências (`npm install`)
- Gera o cliente Prisma e aplica o schema no banco (`prisma generate` + `prisma db push`)
- Popula dados iniciais (`prisma db seed`: usuários e dados astrológicos)
- Inicia o servidor de desenvolvimento na porta **3000**

O PostgreSQL sobe na porta **5432** e só é considerado pronto após o healthcheck; em seguida o serviço `web` inicia.

**Aguarde 1–2 minutos** após o `up -d` antes de acessar (instalação e seed podem demorar).

### Acessar

Abra no navegador: **http://localhost:3000**

### Se o seed falhar na subida

Se no log aparecer que o seed falhou, rode manualmente:

```bash
docker compose exec web npx prisma db seed
```

## Comandos úteis

```bash
# Parar os containers
docker compose down

# Parar e remover volumes (apaga dados do banco)
docker compose down -v

# Ver logs do serviço web
docker compose logs -f web

# Rodar o seed manualmente
docker compose exec web npx prisma db seed

# Abrir Prisma Studio
docker compose exec web npx prisma studio
```

## Resetar banco e subir de novo

**No host** (derruba os containers, apaga o volume do banco e sobe tudo de novo):

```bash
docker compose down -v
docker compose up -d
```

Aguarde a aplicação subir; `db push` e `db seed` rodam de novo automaticamente.

**Dentro do container** (containers continuam rodando; só recria o banco e o seed):

```bash
docker compose exec web npx prisma db push --force-reset
docker compose exec web npx prisma db seed
```

## Estrutura principal do projeto

```
app/
├── api/                    # Rotas de API
│   ├── horoscope/          # Previsão diária e semanal
│   ├── moon/               # Fase da lua
│   ├── famosos/            # Aniversariantes
│   └── docs/               # Documentação da API
├── horoscope/              # Página de horóscopo (dia e semana)
├── aniversariantes/        # Página de aniversariantes do mês
├── docs/                   # Página de documentação
├── components/
prisma/
├── schema.prisma
├── seed.ts                 # Seed principal (usuários + dados astrológicos)
├── seed-zodiac.ts          # Script alternativo de dados astrológicos
└── migrations/
```

## Execução local (sem Docker)

Com Node.js e PostgreSQL instalados e `DATABASE_URL` no `.env`:

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Acesse **http://localhost:3000**.
