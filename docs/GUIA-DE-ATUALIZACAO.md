# GUIA DE ATUALIZAÇÃO — como aplicar sem quebrar nada

Este guia cobre os DOIS pacotes na ordem correta: primeiro o hotfix
**v0.3.26.7**, depois a base **v0.3.27**. Siga na ordem. Não pule o backup.

---

## Passo 0 — Backup (não pule)
1. Abra o app atual e vá em **Parâmetros → Backup** e baixe o JSON. Guarde-o.
2. No código, garanta que está tudo commitado:
   ```bash
   git status          # deve estar limpo
   git checkout develop
   git pull origin develop
   ```
3. Crie um branch de segurança a partir do estado atual:
   ```bash
   git checkout -b hotfix/v0.3.26.7
   ```

---

## Passo 1 — Aplicar o hotfix v0.3.26.7
Copie, do pacote, estes arquivos sobre o projeto (preservando as pastas):
```
src/App.jsx
src/utils/dateUtils.js
src/services/cardInvoiceService.js
src/services/financeRepository.js
src/hooks/useLocalStorage.js
```
> `src/utils/moneyUtils.js` e `src/constants/storageKeys.js` no pacote são só
> referência — NÃO precisam ser copiados (não mudaram).

Verifique e rode:
```bash
npm install          # se ainda não tiver node_modules
npm run build        # precisa compilar sem erros
npm run dev          # abra e teste manualmente (ver checklist do hotfix)
```
Se tudo ok:
```bash
git add .
git commit -m "fix: hotfix v0.3.26.7 (E1/E5/E7/E8/L6)"
git tag v0.3.26.7
```

---

## Passo 2 — Aplicar a base v0.3.27
> Importante: a v0.3.27 já inclui um `App.jsx` que contém as correções do
> hotfix **e** o rewire da fatura. Se você aplicou o Passo 1 a partir DESTE
> mesmo pacote, o `src/App.jsx` aqui já é a versão final (v0.3.27). Nesse caso,
> no Passo 1 você pode copiar todos os arquivos de uma vez e tratar como um só
> commit. Se preferir dois commits separados (recomendado para histórico
> limpo), use o `diffs/App.jsx.diff` como referência do que muda em cada etapa.

Copie os arquivos NOVOS e o serviço alterado:
```
src/services/cardInvoiceOperations.js   (novo)
src/services/cardInvoiceService.js      (todayKey em isInvoiceClosedForNewEntries)
src/App.jsx                             (wrappers atômicos de fatura)
tests/cardInvoiceOperations.test.js     (novo)
vitest.config.js                        (novo)
```

Instale o Vitest (dev) e rode os testes:
```bash
npm install -D vitest
npx vitest run
```
Esperado: **17 testes passando**. Depois:
```bash
npm run build
npm run dev          # teste o checklist da v0.3.27
```
Se tudo ok:
```bash
git add .
git commit -m "refactor: v0.3.27 base - isolamento da fatura com operacao atomica"
git tag v0.3.27-base
```

---

## Passo 3 — Levar para produção
```bash
git checkout main
git pull origin main
git merge hotfix/v0.3.26.7      # ou o branch usado
npm run build
git push origin main
git push origin --tags
git checkout develop
git merge main
git push origin develop
```

---

## Passo 4 — Atualizar a documentação
- Cole `docs/CHANGELOG-ENTRADA-v0_3_26_7.md` no `09-CHANGELOG.md`.
- Adicione o conteúdo de `docs/v0_3_27-BASE-ISOLAMENTO-FATURA.md` como novo doc
  numerado (ex.: `36`/`37`, seguindo sua convenção).
- Registre no `08-REGISTRO-DE-DECISOES.md`: (a) blindagem do versionamento de
  schema; (b) padrão de operação atômica para fatura; (c) E2/E6 adiados p/ v0.3.28.

---

## Se algo der errado (rollback)
```bash
git reset --hard HEAD~1        # desfaz o último commit local
# ou volte ao branch anterior:
git checkout develop
git branch -D hotfix/v0.3.26.7
```
Os dados do usuário no navegador NÃO são tocados por rollback de código. Se você
tiver testado num navegador e quiser voltar dados, restaure o JSON do Passo 0
em Parâmetros → Restaurar.

---

## Erros comuns e como evitar
- **"Falha ao compilar / import não encontrado"**: confira se
  `cardInvoiceOperations.js` foi copiado para `src/services/` e se
  `moneyUtils.js` existe em `src/utils/` (o serviço de fatura o importa).
- **Mistura de quebras de linha (diff gigante)**: os arquivos do pacote usam a
  quebra de linha original do projeto (CRLF no App.jsx). Não rode formatadores
  que convertam para LF antes de commitar, ou o diff fica poluído.
- **Vitest não roda**: precisa de `npm install -D vitest`. Sem rede? Rode o app
  e siga o checklist manual — a lógica já foi validada.
- **Testar à noite**: um dos motivos do hotfix é o fuso; ao validar a virada de
  mês, confie no relógio local do dispositivo.
