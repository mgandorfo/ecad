-- E-CAD — Schema Principal
-- Execute no SQL Editor do Supabase

-- Extensões
create extension if not exists "unaccent";

-- Enum de roles
create type role_usuario as enum ('admin', 'entrevistador', 'recepcionista', 'vigilancia');

-- Perfis de usuário (1:1 com auth.users)
create table perfis (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  email text not null unique,
  role role_usuario not null default 'recepcionista',
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Setores
create table setores (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  ativo boolean not null default true
);

-- Serviços
create table servicos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  setor_id uuid references setores(id) on delete restrict not null,
  ativo boolean not null default true
);

-- Status de atendimento
create table status_atendimento (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cor text not null default '#6b7280',
  ordem int not null default 0,
  ativo boolean not null default true
);

-- Status padrão
insert into status_atendimento (nome, cor, ordem) values
  ('Aguardando', '#f59e0b', 1),
  ('Em Atendimento', '#3b82f6', 2),
  ('Pendente', '#8b5cf6', 3),
  ('Concluído', '#22c55e', 4),
  ('Cancelado', '#ef4444', 5);

-- Beneficiários
create table beneficiarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null unique,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null default 'Caarapó',
  uf char(2) not null default 'MS',
  cep text,
  criado_em timestamptz not null default now()
);

-- Atendimentos
create table atendimentos (
  id uuid primary key default gen_random_uuid(),
  beneficiario_id uuid references beneficiarios(id) on delete restrict not null,
  setor_id uuid references setores(id) on delete restrict not null,
  servico_id uuid references servicos(id) on delete restrict not null,
  status_id uuid references status_atendimento(id) on delete restrict not null,
  servidor_id uuid references perfis(id) on delete set null,
  prioritario boolean not null default false,
  anotacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  concluido_em timestamptz
);

-- Trigger: atualiza atualizado_em
create or replace function set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger atendimentos_atualizado_em
  before update on atendimentos
  for each row execute function set_atualizado_em();

-- Trigger: cria perfil ao registrar usuário no Auth
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
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

alter table perfis enable row level security;
alter table setores enable row level security;
alter table servicos enable row level security;
alter table status_atendimento enable row level security;
alter table beneficiarios enable row level security;
alter table atendimentos enable row level security;

-- Helper: role do usuário logado
create or replace function minha_role()
returns role_usuario language sql security definer stable as $$
  select role from perfis where id = auth.uid();
$$;

-- Perfis: cada um vê o próprio; admin vê todos
create policy "perfis_select" on perfis for select
  using (id = auth.uid() or minha_role() = 'admin');

create policy "perfis_update_admin" on perfis for update
  using (minha_role() = 'admin');

-- Setores e Serviços: todos autenticados leem; só admin escreve
create policy "setores_select" on setores for select using (auth.uid() is not null);
create policy "setores_admin" on setores for all using (minha_role() = 'admin');

create policy "servicos_select" on servicos for select using (auth.uid() is not null);
create policy "servicos_admin" on servicos for all using (minha_role() = 'admin');

-- Status: todos leem; só admin escreve
create policy "status_select" on status_atendimento for select using (auth.uid() is not null);
create policy "status_admin" on status_atendimento for all using (minha_role() = 'admin');

-- Beneficiários: admin, entrevistador e recepcionista leem/escrevem; vigilância só lê
create policy "beneficiarios_select" on beneficiarios for select
  using (auth.uid() is not null);

create policy "beneficiarios_insert" on beneficiarios for insert
  with check (minha_role() in ('admin', 'entrevistador', 'recepcionista'));

create policy "beneficiarios_update" on beneficiarios for update
  using (minha_role() in ('admin', 'entrevistador', 'recepcionista'));

-- Atendimentos: vigilância e admin veem todos; entrevistador vê fila livre + seus; recepcionista só insere
create policy "atendimentos_select_admin_vigilancia" on atendimentos for select
  using (minha_role() in ('admin', 'vigilancia'));

create policy "atendimentos_select_entrevistador" on atendimentos for select
  using (
    minha_role() = 'entrevistador'
    and (servidor_id is null or servidor_id = auth.uid())
  );

create policy "atendimentos_select_recepcionista" on atendimentos for select
  using (minha_role() = 'recepcionista');

create policy "atendimentos_insert" on atendimentos for insert
  with check (minha_role() in ('admin', 'entrevistador', 'recepcionista'));

create policy "atendimentos_update_admin" on atendimentos for update
  using (minha_role() = 'admin');

create policy "atendimentos_update_entrevistador" on atendimentos for update
  using (minha_role() = 'entrevistador' and servidor_id = auth.uid());
