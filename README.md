# E-CAD — Sistema de Gestão de Atendimentos do Cadastro Único

Plataforma web para gerenciamento de atendimentos do CAD (Cadastro Único) da Secretaria de Assistência Social do município de Caarapo - MS. Substitui fichas de papel por um sistema digital de fila de atendimento com controle por perfil de usuário.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Estilo**: Tailwind CSS v4 + shadcn/ui
- **Banco / Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Gráficos**: Recharts
- **PDF**: @react-pdf/renderer
- **Deploy**: Vercel (frontend) + Supabase (backend/DB)

## Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **Administrador** | Acesso total — usuários, setores, serviços, status, relatórios, dashboard |
| **Entrevistador** | Fila de atendimento, seus atendimentos, beneficiários, dashboard próprio |
| **Recepcionista** | Cadastro de beneficiários e abertura de novos atendimentos |
| **Vigilância** | Somente leitura — relatórios e dashboard completos |

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- Conta e projeto no [Supabase](https://supabase.com)

### Configuração

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/mgandorfo/ecad.git
cd ecad
npm install
```

2. Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha `.env.local` com as credenciais do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

> A `SUPABASE_SERVICE_ROLE_KEY` é usada apenas em Server Actions e nunca é exposta ao cliente.

4. Aplique as migrations no banco:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificação de lint |
| `npm run db:types` | Gera tipos TypeScript a partir do schema Supabase |

## Primeiro Acesso

Ao acessar a aplicação pela primeira vez, a rota `/onboarding` estará disponível para cadastrar o administrador inicial. Após o primeiro admin ser criado, essa rota é bloqueada automaticamente.

## Deploy

### Vercel

1. Conecte o repositório GitHub ao projeto na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no painel da Vercel (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Todo push na branch `master` dispara um novo deploy automaticamente

### Supabase (Banco de Dados)

As migrations ficam em `supabase/migrations/`. Para aplicar em um novo projeto:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Para regenerar os tipos TypeScript após alterações no schema:

```bash
npm run db:types
```

## Estrutura de Pastas

```
app/
  (public)/       # Landing page (pública)
  (auth)/         # Login, recuperação de senha
  (app)/          # Área autenticada
    admin/        # CRUDs administrativos
    atendimentos/ # Fila e gestão de atendimentos
    beneficiarios/
    dashboard/
    relatorios/
components/
  ui/             # shadcn/ui
  layout/         # AppShell, Sidebar, Topbar
  beneficiarios/
  atendimentos/
lib/
  supabase/       # Clients server/browser, auth helpers, tipos
  stores/         # Estado reativo (atendimentos)
  utils/          # CPF, formatação
supabase/
  migrations/     # Migrations SQL versionadas
```

## Segurança

- RLS (Row Level Security) habilitado em todas as tabelas — o banco enforça permissões independentemente da UI
- `SUPABASE_SERVICE_ROLE_KEY` isolada exclusivamente em Server Actions (`"use server"`)
- Headers de segurança configurados: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting na rota `/api/relatorios/pdf`: 10 requisições/60s por usuário
- Logs de auditoria em `audit_log` para ações críticas (assumir/concluir atendimento, alterações de usuário)
