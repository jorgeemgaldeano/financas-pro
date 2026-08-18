# Supabase - infraestrutura de sincronização

Esta pasta guarda o schema do servidor em git. **Não usamos a CLI do Supabase**: os
scripts são aplicados a mão pelo SQL Editor do painel. O arquivo existe para o schema ter
história e revisão, não para tooling executar.

| Arquivo | O que é |
|---|---|
| `sql/0001-estado-e-rls.sql` | Schema, gatilhos e RLS. Idempotente. |
| `sql/0002-aceite.sql` | Roteiro de aceite da Fase 2, bloco a bloco. |

Referências: `RN034` e `RN035` em `docs/02-REGRAS-DE-NEGOCIO.md`; `DEC-0039` (mecânica de
sincronização) e `DEC-0042` (o que a Fase 2 decidiu além do roadmap) em
`docs/08-REGISTRO-DE-DECISOES.md`.

---

## A regra inegociável

**A senha da conta compartilhada não pode existir no repositório nem nas variáveis de
ambiente do Vercel.** O login é manual, digitado por quem usa. Senha embutida no código
daria acesso total à base a qualquer pessoa que abrisse a URL e lesse o bundle. É a
decisão D8 da `DEC-0037`, mantida pela `DEC-0039`.

O que **pode** ir para o bundle e para as variáveis do Vercel: a URL do projeto e a
`anon key`. As duas são públicas por design. A segurança mora na RLS, e a RLS deste
schema só libera quem está na tabela `contas_autorizadas`.

---

## Passo a passo no painel (executado uma vez)

### 1. Criar o projeto

`Dashboard > New project`. Região **South America (São Paulo)** - é a mais próxima, e
todo salvamento sobe o payload inteiro.

A senha do banco que o painel pede na criação vai para o seu gerenciador de senhas. Ela
não é a senha da conta de aplicação do passo 2, e também não entra no repositório.

### 2. Criar a conta compartilhada

`Authentication > Users > Add user > Create new user`.

- E-mail: um endereço que os dois dispositivos vão usar.
- Senha: forte, guardada no gerenciador de senhas dos dois.
- Marque **Auto Confirm User**, senão a conta nasce pendente de confirmação por e-mail.

### 3. Desligar o cadastro público

`Authentication > Sign In / Providers > Email > "Allow new users to sign up": desligado`.

Sem isso, qualquer pessoa que leia a `anon key` no bundle pode criar uma conta e virar
`authenticated`. A allowlist do passo 5 já barra essa conta, mas as duas travas juntas é
o desenho: cadastro fechado impede a conta existir, allowlist impede ela servir para
alguma coisa.

### 4. Aplicar o schema

`SQL Editor > New query` - cole `sql/0001-estado-e-rls.sql` inteiro e rode.

Pode ser reexecutado quantas vezes for preciso: nenhum comando derruba tabela nem apaga
dado.

### 5. Autorizar a conta

`Authentication > Users` - copie o **UID** da conta criada no passo 2. Depois, no SQL
Editor:

```sql
insert into public.contas_autorizadas (user_id, descricao)
values ('COLE_O_UID_AQUI', 'conta compartilhada - dois notebooks');
```

Enquanto essa linha não existir, a conta autentica normalmente e **não enxerga nada** -
que é o comportamento correto, não um defeito.

### 6. Rodar o aceite

`sql/0002-aceite.sql`, bloco a bloco, conferindo cada resultado esperado. O bloco 6 deixa
a base vazia para o uso real.

### 7. Guardar URL e chave

`Project Settings > API`:

- **Project URL** e **anon public key** vão para o `.env.local` local (veja `.env.example`
  na raiz) e, na Fase A, para as variáveis de ambiente do Vercel.
- A **service_role key** não vai para lugar nenhum além do painel. Ela ignora RLS.

---

## O modelo, em uma tela

```
estado                      uma linha, id = 1, garantido por check
  payload        jsonb      o mesmo formato de normalizeBackupPayload()
  versao         bigint     numerada pelo servidor (gatilho), nunca pelo cliente
  usuario        text       quem gravou, vindo do LocalStorage do dispositivo
  atualizado_em  timestamptz  carimbada pelo servidor, não pelo relógio do notebook

estado_versoes              histórico das versões já substituídas
  versao         bigint     PK
  payload        jsonb      o ancestral que o merge de três vias vai buscar
  ...                       escrita só pelo gatilho; o cliente lê e não grava
                            retenção: as 100 versões mais recentes

contas_autorizadas          allowlist; RLS ligada e nenhuma policy = invisível pela API
```

**A trava otimista é a cláusula `where`**, não código de servidor:

```sql
update public.estado
   set payload = ..., usuario = ...
 where id = 1 and versao = <a versão que o cliente carregou>;
```

Uma linha afetada é aceite, o gatilho incrementa a versão e arquiva a anterior. Zero
linhas afetadas é a recusa da Fase 3.
