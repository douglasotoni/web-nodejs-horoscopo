# Guia de Setup - Horóscopo por Signo Solar

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 12+ rodando (no IP 192.168.0.100 conforme especificado)
- npm ou yarn

## Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados PostgreSQL

Conecte-se ao PostgreSQL e crie o banco de dados:

```sql
CREATE DATABASE horoscopo_db;
```

Certifique-se de que o usuário `usr_horoscopo` existe e tem permissões:

```sql
CREATE USER usr_horoscopo WITH PASSWORD 'AbbCddEff#112255';
GRANT ALL PRIVILEGES ON DATABASE horoscopo_db TO usr_horoscopo;
ALTER DATABASE horoscopo_db OWNER TO usr_horoscopo;
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure:

```env
DATABASE_URL="postgresql://usr_horoscopo:AbbCddEff%23112255@192.168.0.100:5432/horoscopo_db?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui-minimo-32-caracteres
```

**Importante**: Gere um `NEXTAUTH_SECRET` seguro. Você pode usar:

```bash
openssl rand -base64 32
```

### 4. Executar Migrations

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations (cria as tabelas)
npm run prisma:migrate
```

Quando solicitado, dê um nome à migration (ex: `init`).

### 5. Popular Banco com Dados Iniciais

```bash
npm run prisma:seed
```

Isso criará:
- 3 usuários (admin, editor, viewer)
- Previsões de exemplo para alguns signos

### 6. Iniciar o Servidor

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Credenciais Padrão

Após o seed:

- **Admin**: `admin@horoscopo.com` / `admin123`
- **Editor**: `editor@horoscopo.com` / `editor123`
- **Viewer**: `viewer@horoscopo.com` / `viewer123`

## Verificando o Banco de Dados

Você pode usar o Prisma Studio para visualizar os dados:

```bash
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555`

## Troubleshooting

### Erro: "Can't reach database server"

- Verifique se o PostgreSQL está rodando
- Confirme o IP `192.168.0.100`
- Teste a conexão manualmente:
  ```bash
  psql -h 192.168.0.100 -U usr_horoscopo -d horoscopo_db
  ```

### Erro: "Access denied"

- Verifique as credenciais no `.env`
- Confirme as permissões do usuário PostgreSQL
- Note que `#` na senha deve ser codificado como `%23` na URL

### Erro: "Table doesn't exist"

- Execute `npm run prisma:migrate`
- Verifique se o banco `horoscopo_db` existe

### Erro: "NEXTAUTH_SECRET is not set"

- Configure o `NEXTAUTH_SECRET` no `.env`
- Reinicie o servidor após alterar o `.env`

## Estrutura do Banco

Após as migrations, você terá:

- `users` - Usuários do sistema
- `daily_predictions` - Previsões diárias
- `weekly_predictions` - Previsões semanais
- `audit_logs` - Logs de auditoria

## Próximos Passos

1. Faça login com uma das credenciais
2. Explore o dashboard
3. Crie previsões na área admin
4. Consulte previsões na área pública

