# PLAN.md — Plano de Execução E-CAD

Plano incremental dividido em milestones. Estratégia: **interface primeiro (mockada), backend depois**. Cada milestone corresponde a uma branch, termina com commit final e é mergeada em `main` antes do próximo.

Stack confirmada via `package.json`: Next.js 16.2.4, React 19, TypeScript 5, Tailwind v4, shadcn, Supabase SSR, Recharts, react-hook-form + zod, sonner, lucide-react, date-fns, next-themes.

---

## Milestone 0 — Setup & Fundação

**Branch:** `feat/m0-setup`
**Objetivo:** preparar estrutura, design system e layout base antes de qualquer feature.

**Entregas:**
- [x] Configurar `tailwind.config` e tokens de tema (cores, tipografia) em [app/globals.css](app/globals.css)
- [x] Inicializar shadcn/ui e instalar componentes base (button, input, label, card, table, dialog, dropdown-menu, select, form, badge, toast/sonner, tabs, sheet, skeleton)
- [x] Configurar `next-themes` (light/dark) + provider em [app/layout.tsx](app/layout.tsx)
- [x] Criar estrutura de pastas: `app/(public)`, `app/(auth)`, `app/(app)`, `components/ui`, `components/layout`, `lib`, `types`
- [x] Componentes de layout: `AppShell`, `Sidebar`, `Topbar`, `Breadcrumbs`, `PageHeader`
- [x] Definir tipos TS em `types/` para: `Role`, `User`, `Beneficiario`, `Setor`, `Servico`, `Status`, `Atendimento`
- [x] Mocks em `lib/mocks/` com dados de exemplo para desenvolvimento da UI
- [x] Configurar ESLint + path aliases (`@/*`)
- [x] Copiar `.env.example` com variáveis previstas (Supabase)

**Commit final:** `chore(m0): setup base, design system e estrutura de pastas`

---

## Milestone 1 — Landing Page & Autenticação (UI)

**Branch:** `feat/m1-m2-landing-auth-shell` ✅ mergeada em `master`
**Objetivo:** página pública + telas de login/logout/recuperação (sem backend, apenas UI).

**Entregas:**
- [ ] Landing page em [app/(public)/page.tsx](app/(public)/page.tsx) — hero, features, CTA de login
- [x] Tela de login em [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx) — formulário mockado com redirect para `/dashboard`
- [ ] Tela de recuperação de senha em [app/(auth)/recuperar/page.tsx](app/(auth)/recuperar/page.tsx) — estrutura criada, conteúdo pendente
- [ ] Página de redefinição em [app/(auth)/redefinir/page.tsx](app/(auth)/redefinir/page.tsx) — estrutura criada, conteúdo pendente
- [ ] Validação client-side com mensagens via `sonner` (`react-hook-form` + `zod`)
- [x] Redirecionamento simulado para `/dashboard` após login mockado
- [x] Logo do E-CAD e identidade visual ([components/layout/logo.tsx](components/layout/logo.tsx))
- [x] Layout auth centralizado ([app/(auth)/layout.tsx](app/(auth)/layout.tsx))
- [x] Dark mode como padrão + paleta azul institucional ([app/globals.css](app/globals.css))

**Commit final:** `feat(m1-m2): esqueleto visual E-CAD — shell, navegação e design system`

---

## Milestone 2 — Shell Autenticado & Navegação por Role (UI)

**Branch:** `feat/m1-m2-landing-auth-shell` ✅ mergeada em `master`
**Objetivo:** layout interno após login, com menus adaptados por perfil (mock de role).

**Entregas:**
- [x] Layout `app/(app)/layout.tsx` com sidebar + topbar via `AppShell`
- [x] Seletor de role fake no topbar (dev-only) — Admin / Entrevistador / Recepcionista / Vigilância
- [x] Menu dinâmico conforme role (mockado) com seção Administração separada
- [x] Página `/dashboard` placeholder com cards de KPI
- [x] Página `/perfil` do usuário com avatar e badge de role
- [x] Menu de usuário (avatar + dropdown com nome, email, badge, logout)
- [x] Componente `RoleGuard` ([components/layout/role-guard.tsx](components/layout/role-guard.tsx))
- [x] Responsividade mobile — Sheet lateral que fecha ao navegar
- [x] Páginas placeholder para todas as rotas do menu (sem 404)
- [x] Middleware stub condicional (não quebra sem Supabase configurado)

**Commit final:** `feat(m1-m2): esqueleto visual E-CAD — shell, navegação e design system`

---

## Milestone 3 — Cadastros de Suporte (UI)

**Branch:** `feat/m3-cadastros-ui` ✅ mergeada em `master`
**Objetivo:** CRUDs de Setores, Serviços, Status e Usuários — área administrativa, ainda com dados mockados.

**Entregas:**
- [x] `/admin/setores` — lista + dialog de criar/editar (Código, Nome)
- [x] `/admin/servicos` — lista + dialog de criar/editar (Código, Nome)
- [x] `/admin/status` — lista + dialog (Nome, cor/badge)
- [x] `/admin/usuarios` — lista + dialog (Nome, Email, Role)
- [x] Tabelas com `shadcn/ui` table + busca + paginação client-side
- [x] Confirmação de exclusão em dialog
- [x] Estados: loading, empty, error (skeletons)
- [x] Toasts de sucesso/erro via `sonner`
- [x] `RoleContext` no `AppShell` + `AdminGuard` protegendo rotas `/admin/*`

**Commit final:** `feat(m3): CRUDs administrativos de setores, serviços, status e usuários (UI)`

---

## Milestone 4 — Beneficiários (UI)

**Branch:** `feat/m4-beneficiarios-ui` ✅ mergeada em `master`
**Objetivo:** cadastro e busca de beneficiários.

**Entregas:**
- [x] `/beneficiarios` — lista com busca por nome/CPF
- [x] `/beneficiarios/novo` — formulário (Nome Completo, CPF, Endereço completo)
- [x] `/beneficiarios/[id]` — visualização + edição
- [x] Máscara e validação de CPF com `zod`
- [x] Autocomplete de beneficiários para uso em atendimentos
- [x] Histórico de atendimentos do beneficiário (placeholder)

**Commit final:** `feat(m4): cadastro e busca de beneficiários (UI)`

---

## Milestone 5 — Fila de Atendimento & Gestão (UI)

**Branch:** `feat/m5-atendimentos-ui` ✅ mergeada em `master`
**Objetivo:** núcleo do produto — criar atendimento, fila com prioridade, assumir e gerenciar.

**Entregas:**
- [x] `/atendimentos/novo` — formulário (beneficiário, setor, serviço, prioridade, anotações)
- [x] `/fila` — lista de espera ordenada por prioridade (Entrevistador)
- [x] Botão "Assumir atendimento" na fila com dialog de confirmação
- [x] `/meus-atendimentos` — lista de atendimentos do usuário logado com filtro por status
- [x] `/atendimentos/[id]` — detalhes, troca de status, área de anotações editável, concluir
- [x] Badges de status com cores dinâmicas e de prioridade
- [x] Filtros: setor, serviço, status
- [x] Indicador visual de tempo de espera (atualiza a cada 30s)
- [x] Store reativo de atendimentos (`lib/stores/atendimentos.ts`) para estado entre páginas
- [x] shadcn/ui: alert-dialog, switch, textarea adicionados

**Commit final:** `feat(m5): fila e gestão de atendimentos (UI)`

---

## Milestone 6 — Dashboard & Relatórios (UI)

**Branch:** `feat/m6-dashboard-relatorios-ui` ✅ mergeada em `master`
**Objetivo:** visualizações analíticas com dados mockados.

**Entregas:**
- [x] `/dashboard` com cards de KPI (total do período, em espera, concluídos, tempo médio)
- [x] Gráficos com `recharts`: atendimentos por dia, por setor, por serviço, por status
- [x] Filtros globais do dashboard (período, setor, servidor)
- [x] `/relatorios` — tabela detalhada com filtros completos (busca, data, setor, serviço, status, servidor, prioridade)
- [x] Botão de exportar CSV (client-side, com BOM UTF-8)
- [x] Visão restrita por role (Entrevistador vê só seus dados; Vigilância vê tudo, read-only)
- [x] `/atendimentos` consolidou fila + meus atendimentos em abas (refatoração do M5)
- [x] `NovoAtendimentoSheet` integrado na página de atendimentos

**Commit final:** `feat(m6): dashboard e relatórios com dados mockados (UI)`

---

## Milestone 7 — Supabase: Schema, RLS & Migrations

**Branch:** `feat/supabase-core` ✅ mergeada em `master`
**Objetivo:** virada para backend real. Modelagem de banco e políticas de acesso.

**Entregas:**
- [x] Projeto Supabase criado e variáveis em `.env.local`
- [x] Migrations em [supabase/migrations/](supabase/migrations/) para tabelas: `profiles`, `setores`, `servicos`, `status_atendimento`, `beneficiarios`, `atendimentos`
- [x] Enum de roles: `admin`, `entrevistador`, `recepcionista`, `vigilancia`
- [x] Trigger para criar `profile` a partir de `auth.users`
- [x] Políticas RLS por tabela e por role (documentadas)
- [x] Seeds de desenvolvimento: setores, serviços e status iniciais
- [x] Tipos TS em [lib/supabase/types.ts](lib/supabase/types.ts) + script `npm run db:types`
- [x] Correção: `middleware.ts` → `proxy.ts` (convenção Next.js 16)

**Commit final:** `feat(m7): schema Supabase, RLS e migrations`

---

## Milestone 8 — Integração Auth Real

**Branch:** `feat/m8-auth-integration` ✅ mergeada em `master`
**Objetivo:** substituir auth mockada pelo Supabase Auth.

**Entregas:**
- [x] Clients Supabase server/browser em `lib/supabase/`
- [x] `proxy.ts` com refresh de sessão real (`updateSession`) e proteção de rotas
- [x] Login, logout, recuperação e redefinição de senha via Supabase Auth
- [x] Helper `getCurrentUser()` + `getCurrentRole()` em Server Components
- [x] Removido seletor de role fake; `RoleContext` alimentado pelo perfil real
- [x] `RoleGuard` real baseado em `profile.role` + server-side guard em `app/(app)/admin/layout.tsx`
- [x] Redirecionamentos pós-login por role (`redirectByRole`)
- [x] Onboarding do primeiro admin (`/onboarding` + RPC `primeiro_admin_pendente`)
- [x] `/perfil` usa `getRequiredUser()` — sem mocks
- [x] Correções de segurança: open redirect bloqueado, `RoleContext` default `null`, cast `as Role` substituído por type guard, grant `anon` revogado da RPC

**Commit final:** `feat(m8): integração com Supabase Auth — correções de segurança e UX`

---

## Milestone 9 — Integração Cadastros & Beneficiários

**Branch:** `feat/m9-cadastros-integration` ✅ mergeada em `master`
**Objetivo:** trocar mocks por queries reais nos módulos de cadastro.

**Entregas:**
- [x] Server Actions para CRUD de setores, serviços, status e usuários
- [x] CRUD de beneficiários com validação server-side via `zod`
- [x] Revalidação de cache (`revalidatePath`) após mutações
- [x] Tratamento de erros e toasts de feedback (constraints 23505/23503 traduzidas)
- [x] Respeito à RLS em todas as queries — anon key no cliente, service role key apenas em `auth.admin.*`
- [x] Paginação e busca server-side via `searchParams`
- [x] `BeneficiarioDetailClient` extraído; histórico de atendimentos com joins reais
- [x] `lib/supabase/admin.ts` com `createAdminClient` para operações de gestão de usuários
- [x] Estado de busca/paginação sincronizado via `useSearchParams`

**Commit final:** `feat(m9): integração dos cadastros e beneficiários com Supabase`

---

## Milestone 10 — Integração Atendimentos & Fila

**Branch:** `feat/m10-atendimentos-integration` ✅ mergeada em `master`
**Objetivo:** fila real com realtime.

**Entregas:**
- [x] Criação de atendimento persistida
- [x] Query da fila ordenada por prioridade + data
- [x] Ação "assumir atendimento" (UPDATE atômico — evita race condition)
- [x] Troca de status e conclusão persistidas
- [x] Supabase Realtime para atualizar fila em tempo real (`use-fila-realtime`)
- [x] Filtros e ordenação server-side (setor, serviço)
- [x] Audit fields (`criado_em`, `atualizado_em`, `assumido_em`, `concluido_em`)
- [x] Ação admin: trocar entrevistador de um atendimento
- [x] Autocomplete de beneficiários com busca real no Supabase (portal para escapar overflow)
- [x] Correções Base UI Select: `items` prop + `value={x || null}` (controlled state)
- [x] Correção `concluirAtendimento`: busca status por nome `ilike('conclu%')` em vez de `ordem DESC`

**Commit final:** `feat(m10): integração de atendimentos e fila com Supabase e realtime`

---

## Milestone 11 — Dashboard & Relatórios Reais

**Branch:** `feat/m11-analytics-integration` ✅ mergeada em `master`
**Objetivo:** dados reais nos gráficos e relatórios.

**Entregas:**
- [x] Views/RPCs no Supabase para agregações (por dia, setor, serviço, status) — migrations `20260428000002` e `20260428000003`
- [x] KPIs calculados server-side via RPC `kpis_dashboard` (total, em espera, concluídos, tempo médio)
- [x] Filtros server-side no relatório — paginação 50/página via `searchParams`, busca sanitizada
- [x] Exportação CSV client-side com aviso quando há mais registros que a página atual
- [x] Exportação PDF via `@react-pdf/renderer` — Route Handler `/api/relatorios/pdf`, layout A4 landscape, limite 5000 registros
- [x] Respeito à visibilidade por role nas queries analíticas — entrevistador vê só os próprios; guard server-side bloqueia recepcionista
- [x] Filtros do dashboard e relatórios sincronizados via URL (compartilháveis)
- [x] Remoção de todos os mocks de dashboard e relatórios (`lib/mocks/` não usado nessas rotas)
- [x] Code review pós-implementação: erros silenciados, lógica de KPI, GRANT na view, sanitização de busca, labels nos selects corrigidos

**Commit final:** `feat(m11): dashboard e relatórios integrados com dados reais, PDF e code review`

---

## Milestone 12 — Onboarding, Polish & Acessibilidade

**Branch:** `feat/m12-polish` ✅ mergeada em `master`
**Objetivo:** refino final antes do deploy.

**Entregas:**
- [x] Onboarding do primeiro admin revisado — `role="alert"` no erro, race condition coberta
- [x] Tooltips nas ações principais: alternar tema, "Assumir", exportar CSV e PDF
- [x] Revisão de acessibilidade: skip-link, `aria-current` nos links ativos, `aria-hidden` em ícones decorativos, `tabIndex`+`onKeyDown` em linhas clicáveis, `htmlFor` em todos os labels, `aria-label` no campo de busca, `role="alert"` nos feedbacks de erro de login
- [x] Revisão de responsividade mobile: `overflow-x-auto` em todas as tabelas densas, `PageHeader` com `flex-col` em telas pequenas
- [x] Componentes `EmptyState` e `ErrorState` reutilizáveis aplicados em todos os CRUDs admin, beneficiários, fila, meus atendimentos e relatórios
- [x] `not-found.tsx` (404) e error boundaries `error.tsx` / `(app)/error.tsx` com identidade visual do E-CAD
- [x] Metadata com Open Graph, template de título, `keywords`, `authors` e `robots: noindex` (sistema interno)
- [x] PWA básico: `public/manifest.json` e `public/favicon.svg`
- [x] Remoção de `postcss.config.mjs` obsoleto (Tailwind v4 não necessita)

**Commit final:** `feat(m12): polish, onboarding e acessibilidade`

---

## Milestone 13 — Revisão de Segurança

**Branch:** `chore/m13-security-review` ✅ mergeada em `master`
**Objetivo:** auditoria antes de ir a produção.

**Entregas:**
- [x] Revisão manual de todas as políticas RLS — sem gaps por tabela/role/verbo
- [x] Testes de permissão por role (matriz de acesso) — RLS auditada e validada
- [x] Confirmação de que service role key não vaza para o cliente — isolada em Server Actions `"use server"`
- [x] Rate limiting em rotas sensíveis — `/api/relatorios/pdf`: 10 req/60s por usuário, 429 + `Retry-After`
- [x] Headers de segurança (CSP, HSTS) em `next.config` — CSP, HSTS (63072000s + preload), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] Sanitização/validação server-side em todas as mutações — `error.message` bruto substituído por mensagens genéricas + `console.error` no servidor em todas as 10 Server Actions
- [x] Logs de auditoria para ações críticas — tabela `audit_log` (RLS imutável) + `lib/supabase/audit.ts`; registra: assumir/concluir atendimento, trocar entrevistador, criar/alterar role/excluir usuário
- [x] Executar `/security-review` — auditoria completa via skill de segurança

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
