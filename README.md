# Horóscopo por Signo Solar - MVP

Sistema web completo de previsões astrológicas com controle de acesso, desenvolvido com Next.js, TypeScript, PostgreSQL e Prisma.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **PostgreSQL** (via Prisma ORM)
- **NextAuth** (autenticação com Credentials)
- **bcryptjs** (hash de senhas)
- **Zod** (validação)
- **date-fns** (manipulação de datas)

## 📋 Funcionalidades

### Autenticação e Autorização
- Login com email e senha
- Controle de acesso baseado em roles (admin, editor, viewer)
- Proteção de rotas com middleware
- RBAC (Role-Based Access Control)

### Previsões
- **Previsões Diárias**: Por signo e dia da semana
- **Previsões Semanais**: Por signo e semana ISO
- Consulta individual ou todos os signos
- Filtros por signo, dia da semana, semana e ano

### Área Administrativa
- **Admin/Editor**: Criar, editar e publicar previsões
- **Admin**: Gerenciar usuários (CRUD completo)
- Geração automática de previsões
- Status: Rascunho ou Publicado

## 🗄️ Modelo de Dados

### Tabelas
- `users`: Usuários do sistema
- `daily_predictions`: Previsões diárias
- `weekly_predictions`: Previsões semanais
- `audit_logs`: Logs de auditoria (opcional)

### Enums
- **Sign**: 12 signos do zodíaco
- **Weekday**: Dias da semana
- **UserRole**: admin, editor, viewer
- **PredictionStatus**: draft, published

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <repo-url>
cd web-reactjs-horoscopo
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usr_horoscopo:AbbCddEff%23112255@192.168.0.100:5432/horoscopo_db?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production-min-32-chars
```

**Importante**: Altere o `NEXTAUTH_SECRET` para uma string aleatória de pelo menos 32 caracteres em produção.

### 4. Configure o banco de dados

```bash
# Gerar o Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular com dados iniciais
npm run prisma:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🔐 Credenciais Padrão

Após executar o seed, você pode usar:

- **Admin**: `admin@horoscopo.com` / `admin123`
- **Editor**: `editor@horoscopo.com` / `editor123`
- **Viewer**: `viewer@horoscopo.com` / `viewer123`

## 📁 Estrutura do Projeto

```
web-reactjs-horoscopo/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth
│   │   ├── predictions/             # API pública de previsões
│   │   └── admin/                   # API administrativa
│   ├── admin/                       # Páginas admin
│   ├── dashboard/                   # Dashboard
│   ├── predictions/                 # Consulta de previsões
│   ├── login/                       # Login
│   └── layout.tsx                   # Layout principal
├── components/                      # Componentes React
├── lib/
│   ├── auth.ts                      # Config NextAuth
│   ├── prisma.ts                    # Cliente Prisma
│   ├── generator.ts                 # Gerador de previsões
│   ├── rbac.ts                      # Controle de acesso
│   └── utils.ts                     # Utilitários
├── prisma/
│   ├── schema.prisma                # Schema do banco
│   └── seed.ts                      # Seed script
├── types/                           # Tipos TypeScript
└── middleware.ts                    # Middleware de proteção
```

## 🔌 API Endpoints

### Públicos (autenticados)
- `GET /api/predictions/daily?sign=aries&weekday=monday&isoWeek=1&isoYear=2024`
- `GET /api/predictions/weekly?sign=aries&isoWeek=1&isoYear=2024`
- `GET /api/predictions/all?weekday=monday&isoWeek=1&isoYear=2024`

### Admin/Editor
- `POST /api/admin/predictions/daily` - Criar/atualizar previsão diária
- `PUT /api/admin/predictions/daily` - Atualizar previsão diária
- `DELETE /api/admin/predictions/daily?id=...` - Deletar previsão diária
- `POST /api/admin/predictions/weekly` - Criar/atualizar previsão semanal
- `PUT /api/admin/predictions/weekly` - Atualizar previsão semanal
- `DELETE /api/admin/predictions/weekly?id=...` - Deletar previsão semanal

### Admin apenas
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar usuário
- `PUT /api/admin/users` - Atualizar usuário
- `DELETE /api/admin/users?id=...` - Deletar usuário

## 📝 Exemplos de Uso

### Consultar previsão diária
```bash
curl -X GET "http://localhost:3000/api/predictions/daily?sign=aries&weekday=monday&isoWeek=1&isoYear=2024" \
  -H "Cookie: next-auth.session-token=..."
```

### Criar previsão (admin/editor)
```bash
curl -X POST "http://localhost:3000/api/admin/predictions/daily" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "sign": "aries",
    "weekday": "monday",
    "isoWeek": 1,
    "isoYear": 2024,
    "text": "Previsão para Áries na segunda-feira...",
    "luckyNumber": 15,
    "status": "published",
    "generate": false
  }'
```

### Gerar previsão automaticamente
```bash
curl -X POST "http://localhost:3000/api/admin/predictions/daily" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "sign": "aries",
    "weekday": "monday",
    "isoWeek": 1,
    "isoYear": 2024,
    "generate": true,
    "status": "draft"
  }'
```

## 🎨 Gerador de Previsões

O sistema inclui um gerador automático de previsões baseado em:
- Temas específicos por signo
- Tonalidade positiva com cautelas
- Variações por dia da semana
- Número da sorte determinístico (baseado em seed)

O gerador pode ser acionado via botão "Gerar Automaticamente" na interface admin ou via API com `generate: true`.

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Middleware protegendo rotas privadas
- RBAC implementado
- Validação de dados com Zod
- Proteção contra SQL injection (Prisma)
- Nunca retorna passwordHash nas respostas

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:studio` - Abre Prisma Studio
- `npm run prisma:seed` - Executa seed

## 📄 Licença

Este é um projeto MVP desenvolvido para demonstração.

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
- Verifique se o PostgreSQL está rodando no IP `192.168.0.100`
- Confirme as credenciais no `.env`
- Teste a conexão manualmente

### Erro de autenticação
- Verifique se `NEXTAUTH_SECRET` está configurado
- Limpe os cookies do navegador
- Verifique se o usuário existe no banco

### Erro de migrations
- Certifique-se de que o banco `horoscopo_db` existe
- Execute `npm run prisma:generate` antes das migrations
- Verifique as permissões do usuário PostgreSQL

