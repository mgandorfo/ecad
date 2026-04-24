# PRD — E-CAD

## 1. CONTEXT & PROBLEM

O Atendimento do CAD Cadastro Unico, setor da secretaria de Assistencia social do municipio, atende varios beneficiarios (e futuros beneficiarios) durante o dia, hoje esse atendimento acontece ainda por fichas de papel, preenchidas a mao e guardadas em pastas, esse processo dificulta muito o atendimento, a organizacao da fila de atendimento, a geraçao de relatorios de atendimento e quantificação dos mesmos. Existes algumas soluçaoes como E-suas da prefeitura de Rio Brilhante - MS, mas sao caras e complexas demais para usarmos em Caarapó MS. Necessitamos criar algo mais simples funcional para uma equipe ainda pequena de Entrevistadores.

## 2. PROPOSED SOLUTION

Construir o E-Cad, plataforma web para gestao de atendimentos do CAD, com area para recepcionista, que cadastra os beneficiarios com dados basicos como Nome cpf e endereço, e poe esse atendimento em uma lista de espera que deve ter cadastro por prioridade, tbm area para Entrevistadores que tem acesso a lista de espera e pode assumir o atendimento para ele, tendo acesso somente a a lista sem entrevistaores assumidos e a lista de atendimentos q ele proprio assumiu. o atendimentos devem conter Setor, Serviço, Status, Servidor que assumiu, data, se é prioritario ou nao, Anotações. O Entrevistador deve poder trocar o status do atendimento, alem de poder conclui-lo. Deve haver na aplicaçao um dashboard com filtros para visualizacao do fluxo de dados com filtros. Deve haver relatorio de atendimento com filtros necessarios, Area do administrador para cadastro de usuarios (servidores), setores e serviços e status.

## 3. FUNCTIONAL REQUIREMENTS

- Login e Autenticação
- Dashboards
- Permissões por usuário
- Relatórios e Exportação
- Busca e Filtros
- Landing Page
- Onboarding do Usuário

cadastro de beneficiarios: dados basicos como Nome Completo, CPF, endereço completo
Cadastro de Serviços: com codigo e nome
Cadastro de Setores: com Codigo e Nome
dashoboard com Graficos e filtros
Area de Relatorios com Filtros
Filas atendimento
Gestao do atendimento pelo Entrevistador

## 4. USER PERSONAS

- **Administrador**: Acesso a tudo
- **Entrevistadores**: Acesso a lista e seus proprios atendimentos, alem de Dashboard e relatorios de seus proprios atendimentos, e cadastro de beneficiarios, inserçao de novos atendimentos
- **Recepcionista**: cadastro de beneficiarios e inserçao de novos atendimentos
- **Vigilancia**: Acesso completo a Relatorios e Dashboards apenas (Auditoria Externa)

## 5. TECHNICAL STACK

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel
- Claude Code
- Node.js
- PostgreSQL
- TypeScript

- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS + shadcn/ui
- **Backend/API**: Next.js API Routes (Server Components)
- **Banco de Dados + Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Drag-and-drop**: @dnd-kit
- **Gráficos**: Recharts
- **Linguagem**: TypeScript 5
- **Deploy**: Vercel (frontend) + Supabase (backend/DB)
- **Versionamento**: Git + GitHub

## 6. DESIGN LANGUAGE

Referência: https://www.genesis.tec.br/?dt_portfolio=e-suas

e-Suas:
- Padronização dos processos e informações
- Qualidade no atendimento
- Assistência aos usuários
- Integração aos usuários
- Integração entre os equipamentos socioassistenciais

UX intuitiva.

## 7. PROCESS

- Break app build into logical milestones (steps)
- Each milestone should be a deliverable increment
- Prioritize core functionality first, then iterate
- Test each milestone before moving to the next
