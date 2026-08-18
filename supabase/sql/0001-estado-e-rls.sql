-- =====================================================================
-- Financas PRO - v0.3.38 Fase 2 - Infraestrutura de sincronizacao
--
-- Aplicado manualmente pelo SQL Editor do painel do Supabase.
-- O projeto NAO usa a CLI do Supabase: este arquivo existe para que o
-- schema tenha historia em git, nao para ser executado por tooling.
--
-- Referencias: RN034, RN035, DEC-0039 (mecanica), DEC-0042 (o que este
-- script decide alem do que o roadmap pedia).
--
-- Modelo: uma linha so. O payload e o mesmo de normalizeBackupPayload()/
-- BACKUP_STORAGE_KEYS (13 chaves). O servidor nao interpreta o conteudo:
-- todo calculo do app roda no cliente.
--
-- Idempotente: pode ser reexecutado sem perder dado.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Allowlist de contas
--
-- A conta do Supabase e compartilhada (D7), entao auth.uid() e o mesmo
-- para os dois dispositivos e nao serve para filtrar nada. O que a RLS
-- precisa impedir e OUTRO usuario autenticado ler a base: o cadastro
-- publico vem ligado por padrao no Supabase, e a anon key esta no bundle.
-- Sem esta allowlist, qualquer pessoa que lesse o bundle poderia se
-- cadastrar e virar `authenticated` - que e exatamente o papel que as
-- policies liberam.
--
-- Esta tabela tem RLS ligada e NENHUMA policy: e invisivel pela API.
-- So o painel (service role) a administra.
-- ---------------------------------------------------------------------

create table if not exists public.contas_autorizadas (
  user_id   uuid primary key,
  descricao text        not null default '',
  criado_em timestamptz not null default now()
);

comment on table public.contas_autorizadas is
  'Allowlist de contas que podem ler e gravar o estado. Preenchida a mao pelo painel com o UID da conta compartilhada (DEC-0042).';


-- ---------------------------------------------------------------------
-- 2. estado - a linha unica
-- ---------------------------------------------------------------------

create table if not exists public.estado (
  id            smallint    primary key default 1,
  payload       jsonb       not null,
  versao        bigint      not null default 1,
  usuario       text        not null default '',
  atualizado_em timestamptz not null default now(),

  constraint estado_linha_unica    check (id = 1),
  constraint estado_versao_valida  check (versao > 0),
  constraint estado_payload_objeto check (jsonb_typeof(payload) = 'object')
);

comment on table public.estado is
  'Estado sincronizado do Financas PRO. Sempre uma linha (id = 1), garantida pelo check. O payload segue o formato de normalizeBackupPayload().';
comment on column public.estado.versao is
  'Numerada pelo servidor, nunca pelo cliente. A trava otimista da Fase 3 compara contra este valor.';
comment on column public.estado.usuario is
  'Quem gravou. Vem da chave usuario do LocalStorage do dispositivo (RN035). Nao e autenticacao.';


-- ---------------------------------------------------------------------
-- 3. estado_versoes - o ancestral do merge de tres vias
--
-- Guarda as versoes que JA foram atuais. A versao corrente vive so em
-- `estado`, sem copia aqui - a Fase 4 busca daqui a versao que o cliente
-- havia carregado, e essa nunca e a corrente (se fosse, nao teria havido
-- recusa).
-- ---------------------------------------------------------------------

create table if not exists public.estado_versoes (
  versao        bigint      primary key,
  payload       jsonb       not null,
  usuario       text        not null default '',
  atualizado_em timestamptz not null,
  arquivado_em  timestamptz not null default now()
);

comment on table public.estado_versoes is
  'Historico de versoes substituidas. Escrita so pelo gatilho; o cliente le e nao grava. Retencao: as N versoes mais recentes (DEC-0042).';


-- ---------------------------------------------------------------------
-- 4. Gatilhos: numeracao, data e retencao do lado do servidor
--
-- O cliente manda payload e usuario. Versao e data sao do servidor:
-- relogio de notebook errado nao pode reordenar o historico, e cliente
-- nenhum escolhe o proprio numero de versao.
-- ---------------------------------------------------------------------

create or replace function public.estado_antes_de_inserir()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  new.id            := 1;
  new.versao        := 1;
  new.atualizado_em := now();
  return new;
end;
$fn$;

create or replace function public.estado_antes_de_atualizar()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  -- Quantas versoes passadas ficam disponiveis como ancestral.
  -- Ver DEC-0042 para o raciocinio do numero.
  versoes_retidas constant int := 100;
begin
  -- arquiva a versao que esta sendo substituida
  insert into public.estado_versoes (versao, payload, usuario, atualizado_em)
  values (old.versao, old.payload, old.usuario, old.atualizado_em)
  on conflict (versao) do nothing;

  new.id            := 1;
  new.versao        := old.versao + 1;
  new.atualizado_em := now();

  -- retencao por contagem, tolerante a buracos na numeracao
  delete from public.estado_versoes
   where versao not in (
     select versao from public.estado_versoes
      order by versao desc
      limit versoes_retidas
   );

  return new;
end;
$fn$;

drop trigger if exists estado_bi on public.estado;
create trigger estado_bi
  before insert on public.estado
  for each row execute function public.estado_antes_de_inserir();

drop trigger if exists estado_bu on public.estado;
create trigger estado_bu
  before update on public.estado
  for each row execute function public.estado_antes_de_atualizar();


-- ---------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------

create or replace function public.conta_autorizada()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.contas_autorizadas c where c.user_id = auth.uid()
  );
$fn$;

comment on function public.conta_autorizada() is
  'True quando o usuario autenticado esta na allowlist. SECURITY DEFINER porque as policies precisam ler contas_autorizadas, que e invisivel pela API.';

alter table public.contas_autorizadas enable row level security;
alter table public.estado             enable row level security;
alter table public.estado_versoes     enable row level security;

-- contas_autorizadas: sem policy nenhuma = negado para anon e authenticated.

drop policy if exists estado_ler       on public.estado;
drop policy if exists estado_inserir   on public.estado;
drop policy if exists estado_atualizar on public.estado;

create policy estado_ler on public.estado
  for select to authenticated
  using (public.conta_autorizada());

create policy estado_inserir on public.estado
  for insert to authenticated
  with check (public.conta_autorizada());

create policy estado_atualizar on public.estado
  for update to authenticated
  using (public.conta_autorizada())
  with check (public.conta_autorizada());

-- Sem policy de DELETE, de proposito: "Apagar dados financeiros" (T4)
-- propaga como payload vazio, nao como sumico da linha. A linha some
-- so pelo painel.

drop policy if exists versoes_ler on public.estado_versoes;

create policy versoes_ler on public.estado_versoes
  for select to authenticated
  using (public.conta_autorizada());

-- Sem policy de escrita em estado_versoes: so o gatilho escreve ali.
-- Cliente nao forja historico.


-- ---------------------------------------------------------------------
-- 6. Grants
--
-- A RLS ja barra o anon (nenhuma policy o inclui). O revoke abaixo e
-- segunda barreira: se um dia alguem criar uma policy `to public` sem
-- perceber, o anon continua sem privilegio de tabela.
--
-- Os revokes de DELETE e de escrita em estado_versoes NAO sao decorativos.
-- O Supabase concede ALL em public para anon/authenticated por default
-- privilege, e ausencia de policy so FILTRA linha - nao levanta erro. Sem
-- revoke explicito, um delete indevido retornaria "0 linhas afetadas" em
-- vez de falhar, o que e silencio no lugar de recusa.
-- ---------------------------------------------------------------------

revoke all on public.contas_autorizadas from anon, authenticated;
revoke all on public.estado             from anon;
revoke all on public.estado_versoes     from anon;

revoke delete                 on public.estado         from authenticated;
revoke insert, update, delete on public.estado_versoes from authenticated;

grant select, insert, update on public.estado         to authenticated;
grant select                 on public.estado_versoes to authenticated;

grant execute on function public.conta_autorizada() to authenticated;

-- O gatilho continua escrevendo em estado_versoes apesar do revoke acima:
-- as funcoes sao SECURITY DEFINER e rodam como o dono das tabelas.
