-- E-CAD — Reset + Schema Completo
-- Execute no SQL Editor do Supabase (Project Settings > SQL Editor)
-- ATENÇÃO: apaga todos os dados existentes.

-- =====================
-- RESET
-- =====================

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists atendimentos_atualizado_em on atendimentos;

drop function if exists handle_new_user();
drop function if exists set_atualizado_em();
drop function if exists minha_role();

drop table if exists atendimentos cascade;
drop table if exists beneficiarios cascade;
drop table if exists status_atendimento cascade;
drop table if exists servicos cascade;
drop table if exists setores cascade;
drop table if exists perfis cascade;

drop type if exists role_usuario cascade;

-- =====================
-- EXTENSÕES
-- =====================

create extension if not exists "unaccent";

-- =====================
-- ENUM
-- =====================

create type role_usuario as enum (
  'admin',
  'entrevistador',
  'recepcionista',
  'vigilancia'
);

-- =====================
-- TABELAS
-- =====================

create table perfis (
  id        uuid          primary key references auth.users(id) on delete cascade,
  nome      text          not null,
  email     text          not null unique,
  role      role_usuario  not null default 'recepcionista',
  ativo     boolean       not null default true,
  criado_em timestamptz   not null default now()
);

create table setores (
  id        uuid        primary key default gen_random_uuid(),
  codigo    text        not null unique,
  nome      text        not null,
  ativo     boolean     not null default true
);

create table servicos (
  id        uuid        primary key default gen_random_uuid(),
  codigo    text        not null unique,
  nome      text        not null,
  setor_id  uuid        not null references setores(id) on delete restrict,
  ativo     boolean     not null default true
);

create table status_atendimento (
  id        uuid        primary key default gen_random_uuid(),
  nome      text        not null unique,
  cor       text        not null default '#6b7280',
  ordem     int         not null default 0,
  ativo     boolean     not null default true
);

create table beneficiarios (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null,
  cpf           text        not null unique,
  logradouro    text        not null,
  numero        text        not null,
  complemento   text,
  bairro        text        not null,
  cidade        text        not null default 'Caarapó',
  uf            char(2)     not null default 'MS',
  cep           text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table atendimentos (
  id              uuid        primary key default gen_random_uuid(),
  beneficiario_id uuid        not null references beneficiarios(id)      on delete restrict,
  setor_id        uuid        not null references setores(id)             on delete restrict,
  servico_id      uuid        not null references servicos(id)            on delete restrict,
  status_id       uuid        not null references status_atendimento(id)  on delete restrict,
  servidor_id     uuid        references perfis(id)                       on delete set null,
  criado_por      uuid        not null references perfis(id)              on delete restrict,
  prioritario     boolean     not null default false,
  anotacoes       text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  assumido_em     timestamptz,
  concluido_em    timestamptz
);

-- =====================
-- ÍNDICES
-- =====================

create index beneficiarios_cpf_idx       on beneficiarios (cpf);
create index beneficiarios_nome_idx      on beneficiarios (nome);
create index atendimentos_status_idx     on atendimentos (status_id);
create index atendimentos_servidor_idx   on atendimentos (servidor_id);
create index atendimentos_criado_por_idx on atendimentos (criado_por);
create index atendimentos_setor_idx      on atendimentos (setor_id);
create index atendimentos_criado_em_idx  on atendimentos (criado_em desc);
-- índice composto para query da fila (prioritário primeiro, depois ordem de chegada)
create index atendimentos_fila_idx       on atendimentos (prioritario desc, criado_em asc);

-- =====================
-- FUNÇÕES E TRIGGERS
-- =====================

-- Helper: retorna a role do usuário logado (evita subquery em cada política RLS)
create or replace function minha_role()
returns role_usuario
language sql
security definer
stable
as $$
  select role from perfis where id = auth.uid();
$$;

-- Mantém atualizado_em sincronizado em beneficiarios e atendimentos
create or replace function set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger beneficiarios_atualizado_em
  before update on beneficiarios
  for each row execute function set_atualizado_em();

create trigger atendimentos_atualizado_em
  before update on atendimentos
  for each row execute function set_atualizado_em();

-- Cria perfil automaticamente ao registrar usuário no Supabase Auth
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into perfis (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table perfis             enable row level security;
alter table setores            enable row level security;
alter table servicos           enable row level security;
alter table status_atendimento enable row level security;
alter table beneficiarios      enable row level security;
alter table atendimentos       enable row level security;

-- Perfis: cada um vê o próprio perfil; admin vê todos; admin atualiza qualquer um
create policy "perfis_select" on perfis for select
  using (id = auth.uid() or minha_role() = 'admin');

create policy "perfis_update_proprio" on perfis for update
  using (id = auth.uid());

create policy "perfis_update_admin" on perfis for update
  using (minha_role() = 'admin');

-- Setores: todos autenticados leem; só admin escreve
create policy "setores_select" on setores for select
  using (auth.uid() is not null);

create policy "setores_admin" on setores for all
  using (minha_role() = 'admin');

-- Serviços: todos autenticados leem; só admin escreve
create policy "servicos_select" on servicos for select
  using (auth.uid() is not null);

create policy "servicos_admin" on servicos for all
  using (minha_role() = 'admin');

-- Status: todos autenticados leem; só admin escreve
create policy "status_select" on status_atendimento for select
  using (auth.uid() is not null);

create policy "status_admin" on status_atendimento for all
  using (minha_role() = 'admin');

-- Beneficiários: todos autenticados leem; vigilância não escreve
create policy "beneficiarios_select" on beneficiarios for select
  using (auth.uid() is not null);

create policy "beneficiarios_insert" on beneficiarios for insert
  with check (minha_role() in ('admin', 'entrevistador', 'recepcionista'));

create policy "beneficiarios_update" on beneficiarios for update
  using (minha_role() in ('admin', 'entrevistador', 'recepcionista'));

create policy "beneficiarios_delete" on beneficiarios for delete
  using (minha_role() = 'admin');

-- Atendimentos
-- admin e vigilância: vêem todos
create policy "atendimentos_select_admin_vigilancia" on atendimentos for select
  using (minha_role() in ('admin', 'vigilancia'));

-- entrevistador: vê fila sem servidor + os seus
create policy "atendimentos_select_entrevistador" on atendimentos for select
  using (
    minha_role() = 'entrevistador'
    and (servidor_id is null or servidor_id = auth.uid())
  );

-- recepcionista: vê os que ele abriu
create policy "atendimentos_select_recepcionista" on atendimentos for select
  using (
    minha_role() = 'recepcionista'
    and criado_por = auth.uid()
  );

-- inserção: admin, entrevistador e recepcionista; criado_por deve ser o próprio
create policy "atendimentos_insert" on atendimentos for insert
  with check (
    minha_role() in ('admin', 'entrevistador', 'recepcionista')
    and criado_por = auth.uid()
  );

-- update admin: atualiza qualquer atendimento
create policy "atendimentos_update_admin" on atendimentos for update
  using (minha_role() = 'admin');

-- update entrevistador: atualiza atendimentos da fila (assumir) ou os seus
create policy "atendimentos_update_entrevistador" on atendimentos for update
  using (
    minha_role() = 'entrevistador'
    and (servidor_id is null or servidor_id = auth.uid())
  )
  with check (servidor_id = auth.uid());

-- delete: somente admin
create policy "atendimentos_delete" on atendimentos for delete
  using (minha_role() = 'admin');

-- =====================
-- SEEDS
-- =====================

insert into setores (id, codigo, nome, ativo) values
  ('00000000-0000-0000-0000-000000000001', 'BPC',  'BPC - Benefício de Prestação Continuada', true),
  ('00000000-0000-0000-0000-000000000002', 'CAD',  'CadÚnico - Cadastro Único',               true),
  ('00000000-0000-0000-0000-000000000003', 'PBF',  'Programa Bolsa Família',                  true),
  ('00000000-0000-0000-0000-000000000004', 'CRAS', 'CRAS - Centro de Referência',             true),
  ('00000000-0000-0000-0000-000000000005', 'HBT',  'Habitação',                               false);

insert into servicos (id, codigo, nome, setor_id, ativo) values
  ('00000000-0000-0000-0001-000000000001', 'CAD-INC',  'Inclusão no CadÚnico',  '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000002', 'CAD-ATU',  'Atualização cadastral', '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000003', 'CAD-EXC',  'Exclusão de membro',    '00000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0001-000000000004', 'BPC-SOL',  'Solicitação BPC',       '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000005', 'BPC-REV',  'Revisão BPC',           '00000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0001-000000000006', 'PBF-CAD',  'Cadastramento PBF',     '00000000-0000-0000-0000-000000000003', true),
  ('00000000-0000-0000-0001-000000000007', 'PBF-DES',  'Desbloqueio PBF',       '00000000-0000-0000-0000-000000000003', true),
  ('00000000-0000-0000-0001-000000000008', 'CRAS-ATD', 'Atendimento CRAS',      '00000000-0000-0000-0000-000000000004', true);

insert into status_atendimento (nome, cor, ordem) values
  ('Aguardando',            '#f59e0b', 1),
  ('Em Atendimento',        '#3b82f6', 2),
  ('Pendente Documentação', '#a855f7', 3),
  ('Concluído',             '#22c55e', 4),
  ('Cancelado',             '#ef4444', 5);
