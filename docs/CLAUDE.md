# CLAUDE.md — E-CAD

## Visão Geral do Projeto

E-CAD é uma plataforma web para gestão de atendimentos do CAD (Cadastro Único) da Secretaria de Assistência Social do município de Caarapo - MS. Substitui fichas de papel por um sistema digital de fila de atendimento com controle por perfil de usuário.

## Stack Técnica

- **Framework**: Next.js (App Router) + React + TypeScript 5
- **Estilo**: Tailwind CSS + shadcn/ui
- **Banco de Dados / Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Drag-and-drop**: @dnd-kit
- **Gráficos**: Recharts
- **Deploy**: Vercel (frontend) + Supabase (backend/DB)
- **Versionamento**: Git + GitHub

> Leia `node_modules/next/dist/docs/` antes de escrever código Next.js — esta versão pode ter APIs que diferem do seu treinamento.

## Estrutura de Perfis (Roles)

| Perfil | Permissões |
|---|---|
| **Administrador** | Acesso total — usuários, setores, serviços, status, relatórios, dashboard |
| **Entrevistador** | Lista de espera (sem entrevistadores), seus próprios atendimentos, dashboard e relatórios próprios, cadastro de beneficiários, inserção de atendimentos |
| **Recepcionista** | Cadastro de beneficiários e inserção de novos atendimentos |
| **Vigilância** | Somente leitura — Relatórios e Dashboards completos (auditoria externa) |

RLS do Supabase deve enforçar essas permissões no banco de dados. Nunca confiar apenas na UI para controle de acesso.

## Módulos Principais

### Autenticação
- Login via Supabase Auth
- Controle de sessão por perfil
- Redirecionamento pós-login conforme role

### Beneficiários
- Campos: Nome Completo, CPF, Endereço completo
- CRUD pelo Administrador, Entrevistador e Recepcionista

### Atendimentos
- Campos obrigatórios: Setor, Serviço, Status, Servidor responsável, Data, Prioridade (boolean), Anotações
- Fila com ordem por prioridade
- Entrevistador assume atendimento da lista de espera
- Troca de status e conclusão pelo Entrevistador

### Cadastros de Suporte (Admin)
- **Setores**: Código + Nome
- **Serviços**: Código + Nome
- **Status**: configuráveis
- **Usuários/Servidores**: cadastro e gerenciamento de roles

### Dashboard
- Gráficos com Recharts
- Filtros por período, setor, serviço, status, servidor

### Relatórios
- Listagem filtrada de atendimentos
- Exportação (definir formato: PDF / CSV)
- Filtros: período, setor, serviço, status, servidor, prioridade

### Fila de Atendimento
- Ordenação por prioridade
- Drag-and-drop com @dnd-kit (se necessário reordenar manualmente)
- Visibilidade restrita por role

## Convenções de Código

- TypeScript estrito — sem `any`
- Server Components por padrão; `"use client"` somente quando necessário (eventos, hooks de estado)
- Rotas de API via Route Handlers do Next.js (`app/api/`)
- Chamadas ao Supabase no servidor sempre que possível (evitar expor service key no cliente)
- Variáveis de ambiente sensíveis apenas em `.env.local` e nunca commitadas

## Milestones de Desenvolvimento

1. **Setup base** — Next.js + Supabase + autenticação + roles
2. **CRUD de cadastros** — Beneficiários, Setores, Serviços, Status, Usuários
3. **Fila de atendimento** — criação, fila por prioridade, assumir atendimento
4. **Gestão do atendimento** — troca de status, conclusão, anotações
5. **Dashboard** — gráficos e filtros
6. **Relatórios** — filtros e exportação
7. **Landing page + Onboarding**
8. **Revisão de segurança** — RLS, permissões, auditoria

Cada milestone deve ser testado antes de avançar ao próximo.

## Decisões de Design

- UX intuitiva — equipe pequena sem treinamento técnico profundo
- Referência visual: e-Suas (padronização, qualidade no atendimento, integração)
- shadcn/ui como sistema de componentes base
- Responsivo para uso em desktop (secretaria municipal)
