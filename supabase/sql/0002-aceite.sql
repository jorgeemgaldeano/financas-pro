-- =====================================================================
-- Financas PRO - v0.3.38 Fase 2 - Roteiro de aceite
--
-- Aceite do roadmap: "insert e select manuais pelo painel respeitando a
-- RLS". Rode BLOCO A BLOCO no SQL Editor, conferindo o resultado
-- esperado de cada um. O bloco 0 e o bloco 6 sao os unicos que gravam.
--
-- ANTES DE COMECAR: troque UID_DA_CONTA pelo UID real da conta
-- compartilhada (painel > Authentication > Users > coluna UID).
-- Nao ha senha nenhuma neste arquivo, e nao deve haver.
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
select * from public.estado;
select * from public.estado_versoes;
reset role;


-- ---------------------------------------------------------------------
-- BLOCO 2 - autenticado FORA da allowlist nao ve nada
-- Simula alguem que leu o bundle e criou a propria conta.
-- Esperado: 0 linhas.
-- ---------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', false);
set role authenticated;
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

insert into public.estado (payload, usuario)
values ('{"trans":[],"contas":[],"cats":[]}'::jsonb, 'Jorge');

select id, versao, usuario, atualizado_em from public.estado;
-- Esperado: id=1, versao=1, usuario=Jorge, data de agora.


-- ---------------------------------------------------------------------
-- BLOCO 4 - a trava otimista: versao certa passa, versao errada nao
-- Continua na mesma sessao autenticada do bloco 3.
-- ---------------------------------------------------------------------

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


-- ---------------------------------------------------------------------
-- BLOCO 5 - o que o cliente NAO pode fazer
--
-- Esperado: os tres comandos falham com "permission denied for table".
-- RODE UM DE CADA VEZ: o primeiro erro aborta a transacao e os demais
-- comandos do mesmo run nao chegam a ser avaliados.
--
-- Tem de ser erro, e nao "0 linhas afetadas". Ausencia de policy so
-- filtra linha; quem transforma isso em recusa visivel sao os revokes
-- explicitos do bloco 6 do 0001. Se algum destes retornar sucesso com 0
-- linhas, os revokes nao foram aplicados.
-- ---------------------------------------------------------------------

-- 5a) apagar a linha de estado
delete from public.estado where id = 1;

-- 5b) forjar historico
insert into public.estado_versoes (versao, payload, usuario, atualizado_em)
values (999, '{}'::jsonb, 'falso', now());

-- 5c) se autoconceder acesso
insert into public.contas_autorizadas (user_id) values (gen_random_uuid());


-- ---------------------------------------------------------------------
-- BLOCO 5z - voltar a ser voce mesmo
-- Rode isto sozinho depois do bloco 5, ja que o erro anterior abortou a
-- transacao. Sem isto a sessao continua no papel `authenticated` e o
-- bloco 6 falha.
-- ---------------------------------------------------------------------
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
