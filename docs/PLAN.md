# PLAN.md — Plano de Execução E-CAD

Plano incremental dividido em milestones. Estratégia: **interface primeiro (mockada), backend depois**. Cada milestone corresponde a uma branch, termina com commit final e é mergeada em `main` antes do próximo.

Stack confirmada via `package.json`: Next.js 16.2.4, React 19, TypeScript 5, Tailwind v4, shadcn, Supabase SSR, Recharts, react-hook-form + zod, sonner, lucide-react, date-fns, next-themes.

---

## Milestone 0 — Setup & Fundação

**Branch:** `feat/m0-setup`
**Objetivo:** preparar estrutura, design system e layout base antes de qualquer feature.

**Entregas:**
- [ ] Configurar `tailwind.config` e tokens de tema (cores, tipografia) em [app/globals.css](app/globals.css)
- [ ] Inicializar shadcn/ui e instalar componentes base (button, input, label, card, table, dialog, dropdown-menu, select, form, badge, toast/sonner, tabs, sheet, skeleton)
- [ ] Configurar `next-themes` (light/dark) + provider em [app/layout.tsx](app/layout.tsx)
- [ ] Criar estrutura de pastas: `app/(public)`, `app/(auth)`, `app/(app)`, `components/ui`, `components/layout`, `lib`, `types`
- [ ] Componentes de layout: `AppShell`, `Sidebar`, `Topbar`, `Breadcrumbs`, `PageHeader`
- [ ] Definir tipos TS em `types/` para: `Role`, `User`, `Beneficiario`, `Setor`, `Servico`, `Status`, `Atendimento`
- [ ] Mocks em `lib/mocks/` com dados de exemplo para desenvolvimento da UI
- [ ] Configurar ESLint + path aliases (`@/*`)
- [ ] Copiar `.env.example` com variáveis previstas (Supabase)

**Commit final:** `chore(m0): setup base, design system e estrutura de pastas`

---

## Milestone 1 — Landing Page & Autenticação (UI)

**Branch:** `feat/m1-landing-auth-ui`
**Objetivo:** página pública + telas de login/logout/recuperação (sem backend, apenas UI).

**Entregas:**
- [ ] Landing page em [app/(public)/page.tsx](app/(public)/page.tsx) — hero, features, CTA de login
- [ ] Tela de login em [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx) com `react-hook-form` + `zod`
- [ ] Tela de recuperação de senha em [app/(auth)/recuperar/page.tsx](app/(auth)/recuperar/page.tsx)
- [ ] Página de redefinição em [app/(auth)/redefinir/page.tsx](app/(auth)/redefinir/page.tsx)
- [ ] Validação client-side com mensagens via `sonner`
- [ ] Redirecionamento simulado para `/dashboard` após login mockado
- [ ] Logo do E-CAD e identidade visual

**Commit final:** `feat(m1): landing page e telas de autenticação (UI mockada)`

---

## Milestone 2 — Shell Autenticado & Navegação por Role (UI)

**Branch:** `feat/m2-app-shell-ui`
**Objetivo:** layout interno após login, com menus adaptados por perfil (mock de role).

**Entregas:**
- [ ] Layout `app/(app)/layout.tsx` com sidebar + topbar
- [ ] Seletor de role fake no topbar (dev-only) para testar views: Admin / Entrevistador / Recepcionista / Vigilância
- [ ] Menu dinâmico conforme role (mockado)
- [ ] Página `/dashboard` placeholder
- [ ] Página `/perfil` do usuário
- [ ] Menu de usuário (avatar + dropdown logout)
- [ ] Componente `RoleGuard` para esconder áreas conforme role
- [ ] Responsividade mobile (sheet lateral)

**Commit final:** `feat(m2): app shell com navegação por role (mockada)`

---

## Milestone 3 — Cadastros de Suporte (UI)

**Branch:** `feat/m3-cadastros-ui`
**Objetivo:** CRUDs de Setores, Serviços, Status e Usuários — área administrativa, ainda com dados mockados.

**Entregas:**
- [ ] `/admin/setores` — lista + dialog de criar/editar (Código, Nome)
- [ ] `/admin/servicos` — lista + dialog de criar/editar (Código, Nome)
- [ ] `/admin/status` — lista + dialog (Nome, cor/badge)
- [ ] `/admin/usuarios` — lista + dialog (Nome, Email, Role)
- [ ] Tabelas com `shadcn/ui` table + busca + paginação client-side
- [ ] Confirmação de exclusão em dialog
- [ ] Estados: loading, empty, error (skeletons)
- [ ] Toasts de sucesso/erro via `sonner`

**Commit final:** `feat(m3): CRUDs administrativos de setores, serviços, status e usuários (UI)`

---

## Milestone 4 — Beneficiários (UI)

**Branch:** `feat/m4-beneficiarios-ui`
**Objetivo:** cadastro e busca de beneficiários.

**Entregas:**
- [ ] `/beneficiarios` — lista com busca por nome/CPF
- [ ] `/beneficiarios/novo` — formulário (Nome Completo, CPF, Endereço completo)
- [ ] `/beneficiarios/[id]` — visualização + edição
- [ ] Máscara e validação de CPF com `zod`
- [ ] Autocomplete de beneficiários para uso em atendimentos
- [ ] Histórico de atendimentos do beneficiário (placeholder)

**Commit final:** `feat(m4): cadastro e busca de beneficiários (UI)`

---

## Milestone 5 — Fila de Atendimento & Gestão (UI)

**Branch:** `feat/m5-atendimentos-ui`
**Objetivo:** núcleo do produto — criar atendimento, fila com prioridade, assumir e gerenciar.

**Entregas:**
- [ ] `/atendimentos/novo` — formulário (beneficiário, setor, serviço, prioridade, anotações)
- [ ] `/fila` — lista de espera ordenada por prioridade (Entrevistador)
- [ ] Botão "Assumir atendimento" na fila
- [ ] `/meus-atendimentos` — lista de atendimentos do usuário logado
- [ ] `/atendimentos/[id]` — detalhes, troca de status, anotações, concluir
- [ ] Badges de status com cores e de prioridade
- [ ] Filtros: setor, serviço, status, data
- [ ] Indicador visual de tempo de espera

**Commit final:** `feat(m5): fila e gestão de atendimentos (UI)`

---

## Milestone 6 — Dashboard & Relatórios (UI)

**Branch:** `feat/m6-dashboard-relatorios-ui`
**Objetivo:** visualizações analíticas com dados mockados.

**Entregas:**
- [ ] `/dashboard` com cards de KPI (total do dia, em espera, concluídos, tempo médio)
- [ ] Gráficos com `recharts`: atendimentos por dia, por setor, por serviço, por status
- [ ] Filtros globais do dashboard (período, setor, serviço, servidor)
- [ ] `/relatorios` — tabela detalhada com filtros completos
- [ ] Botão de exportar CSV (client-side inicialmente)
- [ ] Visão restrita por role (Entrevistador vê só seus dados; Vigilância vê tudo, read-only)

**Commit final:** `feat(m6): dashboard e relatórios com dados mockados (UI)`

---

## Milestone 7 — Supabase: Schema, RLS & Migrations

**Branch:** `feat/m7-supabase-schema`
**Objetivo:** virada para backend real. Modelagem de banco e políticas de acesso.

**Entregas:**
- [ ] Projeto Supabase criado e variáveis em `.env.local`
- [ ] Migrations em [supabase/migrations/](supabase/migrations/) para tabelas: `profiles`, `setores`, `servicos`, `status`, `beneficiarios`, `atendimentos`
- [ ] Enum de roles: `admin`, `entrevistador`, `recepcionista`, `vigilancia`
- [ ] Trigger para criar `profile` a partir de `auth.users`
- [ ] Políticas RLS por tabela e por role (documentadas)
- [ ] Seeds de desenvolvimento: setores, serviços e status iniciais
- [ ] Tipos TS gerados via `supabase gen types typescript`

**Commit final:** `feat(m7): schema Supabase, RLS e migrations`

---

## Milestone 8 — Integração Auth Real

**Branch:** `feat/m8-auth-integration`
**Objetivo:** substituir auth mockada pelo Supabase Auth.

**Entregas:**
- [ ] Clients Supabase server/browser em `lib/supabase/`
- [ ] [middleware.ts](middleware.ts) com refresh de sessão e proteção de rotas
- [ ] Login, logout, recuperação e redefinição de senha via Supabase Auth
- [ ] Helper `getCurrentUser()` + `getCurrentRole()` em Server Components
- [ ] Remover seletor de role fake
- [ ] `RoleGuard` real baseado em `profile.role`
- [ ] Redirecionamentos pós-login por role

**Commit final:** `feat(m8): integração com Supabase Auth`

---

## Milestone 9 — Integração Cadastros & Beneficiários

**Branch:** `feat/m9-cadastros-integration`
**Objetivo:** trocar mocks por queries reais nos módulos de cadastro.

**Entregas:**
- [ ] Server Actions / Route Handlers para CRUD de setores, serviços, status, usuários
- [ ] CRUD de beneficiários com validação server-side via `zod`
- [ ] Revalidação de cache (`revalidatePath`) após mutações
- [ ] Tratamento de erros e toasts de feedback
- [ ] Respeito à RLS em todas as queries (sem service key no cliente)
- [ ] Paginação e busca server-side

**Commit final:** `feat(m9): integração dos cadastros e beneficiários com Supabase`

---

## Milestone 10 — Integração Atendimentos & Fila

**Branch:** `feat/m10-atendimentos-integration`
**Objetivo:** fila real com realtime.

**Entregas:**
- [ ] Criação de atendimento persistida
- [ ] Query da fila ordenada por prioridade + data
- [ ] Ação "assumir atendimento" (transação + verificação de race condition)
- [ ] Troca de status e conclusão persistidas
- [ ] Supabase Realtime para atualizar fila em tempo real
- [ ] Filtros e ordenação server-side
- [ ] Audit fields (`created_at`, `updated_at`, `assumed_at`, `concluded_at`)

**Commit final:** `feat(m10): integração de atendimentos e fila com realtime`

---

## Milestone 11 — Dashboard & Relatórios Reais

**Branch:** `feat/m11-analytics-integration`
**Objetivo:** dados reais nos gráficos e relatórios.

**Entregas:**
- [ ] Views/RPCs no Supabase para agregações (por dia, setor, serviço, status)
- [ ] KPIs calculados server-side
- [ ] Filtros server-side no relatório
- [ ] Exportação CSV server-side (stream)
- [ ] Exportação PDF (avaliar `@react-pdf/renderer` se necessário)
- [ ] Respeito à visibilidade por role nas queries analíticas

**Commit final:** `feat(m11): dashboard e relatórios integrados`

---

## Milestone 12 — Onboarding, Polish & Acessibilidade

**Branch:** `feat/m12-polish`
**Objetivo:** refino final antes do deploy.

**Entregas:**
- [ ] Onboarding do primeiro admin (fluxo inicial se não houver admin no sistema)
- [ ] Tour/tooltips nas principais telas
- [ ] Revisão de acessibilidade (foco, aria, contraste)
- [ ] Revisão de responsividade mobile
- [ ] Estados de erro e vazio em todas as telas
- [ ] 404 e 500 customizadas
- [ ] Metadata/SEO da landing
- [ ] Favicon e PWA básico (opcional)

**Commit final:** `feat(m12): polish, onboarding e acessibilidade`

---

## Milestone 13 — Revisão de Segurança

**Branch:** `chore/m13-security-review`
**Objetivo:** auditoria antes de ir a produção.

**Entregas:**
- [ ] Revisão manual de todas as políticas RLS
- [ ] Testes de permissão por role (matriz de acesso)
- [ ] Confirmação de que service role key não vaza para o cliente
- [ ] Rate limiting em rotas sensíveis
- [ ] Headers de segurança (CSP, HSTS) em `next.config`
- [ ] Sanitização/validação server-side em todas as mutações
- [ ] Logs de auditoria para ações críticas (assumir, concluir, alterar role)
- [ ] Executar `/security-review`

**Commit final:** `chore(m13): revisão de segurança e hardening`

---

## Milestone 14 — Deploy em Produção

**Branch:** `chore/m14-deploy`
**Objetivo:** publicar na Vercel + Supabase produção.

**Entregas:**
- [ ] Projeto Supabase de produção com migrations aplicadas
- [ ] Seeds mínimos de produção (admin inicial, status padrão)
- [ ] Projeto Vercel conectado ao GitHub
- [ ] Variáveis de ambiente em Vercel (Preview + Production)
- [ ] Domínio customizado e HTTPS
- [ ] Smoke test em produção (login, criar atendimento, fila, dashboard)
- [ ] README com instruções de setup e deploy
- [ ] Backup e política de retenção no Supabase

**Commit final:** `chore(m14): deploy em produção`

---

## Regras Gerais

- Cada milestone vira uma PR contra `main` e só é mergeada após review/teste.
- Não avançar para o próximo milestone com o anterior quebrado.
- UI mockada (M0–M6) usa `lib/mocks/` — remover todas as importações de mock ao fim do M11.
- Ao detectar diferença entre este plano e a realidade do Next.js 16, consultar `node_modules/next/dist/docs/` antes de codar.
