-- =====================================================================
-- Financas PRO - v0.3.38 Fase 2 - Roteiro de aceite
--
-- Aceite do roadmap: "insert e select manuais pelo painel respeitando a
-- RLS". Rode BLOCO A BLOCO no SQL Editor, conferindo o resultado
-- esperado de cada um. O bloco 0 e o bloco 6 sao os unicos que gravam
-- de fato (fora as inserções do bloco 3, que a limpeza do bloco 6 desfaz).
--
-- ANTES DE COMECAR: troque UID_DA_CONTA pelo UID real da conta
-- compartilhada (painel > Authentication > Users > coluna UID).
-- Nao ha senha nenhuma neste arquivo, e nao deve haver.
--
-- CADA BLOCO E AUTOCONTIDO DE PROPOSITO. O SQL Editor do Supabase nao
-- garante que `set role`/`set_config` de um "Run" sobrevivam ate o
-- proximo "Run" - o achado que gerou esta correcao: um bloco que
-- assumia continuidade da sessao anterior acabou rodando como
-- `postgres` (o dono das tabelas, que ignora RLS e privilegio por
-- completo) sem erro nenhum, e um insert que deveria ser negado passou.
-- Por isso todo bloco abaixo que precisa impersonar `authenticated`
-- refaz o `set_config`/`set role` do zero, e traz uma trava (`do $$...`)
-- que ABORTA com erro claro se a sessao nao virou quem devia.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BLOCO 0 - a allowlist esta preenchida?
-- Esperado: 1 linha, com o UID da conta compartilhada.
-- ---------------------------------------------------------------------
select * from public.contas_autorizadas;


-- ---------------------------------------------------------------------
-- BLOCO 1 - anon nao ve nada
--
-- Esperado: ERRO 42501 "permission denied for table estado" nas duas
-- consultas - e NAO "0 linhas". O revoke all do 0001 tira do anon o
-- privilegio de tabela por completo, e o Postgres checa privilegio de
-- tabela ANTES de avaliar qualquer policy de RLS. Sem privilegio
-- nenhum, a policy nunca chega a rodar: e recusa na porta, mais forte
-- que "filtrado e vazio". Este e o bloco que justifica a anon key
-- poder viajar no bundle.
--
-- Se o SQL Editor mostrar o HINT "GRANT SELECT ON public.estado TO
-- anon", IGNORE-O. E o aviso generico que o Postgres anexa a todo
-- 42501, sem saber que a ausencia de privilegio aqui e intencional.
-- Segui-lo destrancaria a tabela para qualquer pessoa que lesse a
-- anon key no bundle - exatamente o que este bloco existe para provar
-- que nao acontece.
-- ---------------------------------------------------------------------
set role anon;

do $$
begin
  if current_user <> 'anon' then
    raise exception 'esperado current_user = anon, veio %. A sessao nao herdou o papel - pare aqui.', current_user;
  end if;
end $$;

select * from public.estado;
select * from public.estado_versoes;
reset role;


-- ---------------------------------------------------------------------
-- BLOCO 2 - autenticado FORA da allowlist nao ve nada
-- Simula alguem que leu o bundle e criou a propria conta.
-- Esperado: 0 linhas. Se em vez disso vier erro de sintaxe em `do $$`,
-- confira se colou o bloco inteiro (a trava faz parte do bloco).
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', false);
set role authenticated;

do $$
begin
  if current_user <> 'authenticated' then
    raise exception 'esperado current_user = authenticated, veio %. A sessao nao herdou o papel - pare aqui.', current_user;
  end if;
end $$;

select * from public.estado;
reset role;
select set_config('request.jwt.claims', null, false);


-- ---------------------------------------------------------------------
-- BLOCO 3 - a conta autorizada insere (o primeiro estado)
-- Esperado: 1 linha inserida. Depois, versao = 1.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"UID_DA_CONTA","role":"authenticated"}', false);
set role authenticated;

do $$
begin
  if current_user <> 'authenticated' then
    raise exception 'esperado current_user = authenticated, veio %. A sessao nao herdou o papel - pare aqui.', current_user;
  end if;
end $$;

insert into public.estado (payload, usuario)
values ('{"trans":[],"contas":[],"cats":[]}'::jsonb, 'Jorge');

select id, versao, usuario, atualizado_em from public.estado;
-- Esperado: id=1, versao=1, usuario=Jorge, data de agora.

reset role;
select set_config('request.jwt.claims', null, false);


-- ---------------------------------------------------------------------
-- BLOCO 4 - a trava otimista: versao certa passa, versao errada nao
--
-- AUTOCONTIDO: refaz o set_config/set role do zero, nao depende do
-- bloco 3 ter deixado a sessao no estado certo.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"UID_DA_CONTA","role":"authenticated"}', false);
set role authenticated;

do $$
begin
  if current_user <> 'authenticated' then
    raise exception 'esperado current_user = authenticated, veio %. A sessao nao herdou o papel - pare aqui.', current_user;
  end if;
end $$;

-- 4a) versao esperada correta -> UPDATE 1
update public.estado
   set payload = '{"trans":[{"id":"t1"}],"contas":[],"cats":[]}'::jsonb,
       usuario = 'Jorge'
 where id = 1 and versao = 1;

select versao from public.estado;                 -- Esperado: 2
select versao, usuario from public.estado_versoes; -- Esperado: 1 linha, versao 1

-- 4b) versao esperada desatualizada -> UPDATE 0 (a recusa da Fase 3)
update public.estado
   set payload = '{"trans":[],"contas":[],"cats":[]}'::jsonb,
       usuario = 'Outro'
 where id = 1 and versao = 1;

select versao, usuario from public.estado;        -- Esperado: 2, Jorge (intacto)

reset role;
select set_config('request.jwt.claims', null, false);


-- ---------------------------------------------------------------------
-- BLOCO 5 - o que o cliente NAO pode fazer
--
-- AUTOCONTIDO: refaz o set_config/set role do zero. Cada tentativa vem
-- embrulhada no seu proprio `begin`/`rollback`, entao os tres cabem no
-- mesmo "Run" mesmo esperando falhar: o rollback fecha a transacao
-- abortada antes da proxima tentativa comecar, e nada fica gravado.
--
-- Esperado: os tres comandos falham com "permission denied for table".
-- Tem de ser erro, e nao "0 linhas afetadas". Ausencia de policy so
-- filtra linha; quem transforma isso em recusa visivel sao os revokes
-- explicitos do bloco 6 do 0001. Se algum destes retornar sucesso, ou
-- "0 linhas afetadas" em vez de erro, os revokes nao foram aplicados.
--
-- Se aparecer o HINT sugerindo GRANT, IGNORE-O pelo mesmo motivo dos
-- blocos anteriores: e generico e destrancaria o que este teste prova
-- estar trancado.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"UID_DA_CONTA","role":"authenticated"}', false);
set role authenticated;

do $$
begin
  if current_user <> 'authenticated' then
    raise exception 'esperado current_user = authenticated, veio %. A sessao nao herdou o papel - pare aqui.', current_user;
  end if;
end $$;

-- 5a) apagar a linha de estado
begin;
delete from public.estado where id = 1;
rollback;

-- 5b) forjar historico
begin;
insert into public.estado_versoes (versao, payload, usuario, atualizado_em)
values (999, '{}'::jsonb, 'falso', now());
rollback;

-- 5c) se autoconceder acesso
begin;
insert into public.contas_autorizadas (user_id) values (gen_random_uuid());
rollback;

reset role;
select set_config('request.jwt.claims', null, false);
select current_user;  -- Esperado: postgres


-- ---------------------------------------------------------------------
-- BLOCO 6 - limpeza
-- A base real comeca vazia (D9): o primeiro payload que o app enviar e a
-- base inicial. Rode isto depois do aceite, como service role.
-- ---------------------------------------------------------------------
truncate public.estado, public.estado_versoes;

select
  (select count(*) from public.estado)         as estado,
  (select count(*) from public.estado_versoes) as versoes,
  (select count(*) from public.contas_autorizadas) as autorizadas;
-- Esperado: 0, 0, 1
