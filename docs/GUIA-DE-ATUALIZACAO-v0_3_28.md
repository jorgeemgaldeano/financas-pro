# GUIA DE ATUALIZAÇÃO — v0.3.28 (consolidação do modelo de dados)

Pré-requisito: v0.3.27 já aplicada (isolamento de fatura). Se você ainda não
aplicou, siga primeiro o guia do pacote anterior.

---

## Passo 0 — Backup (não pule)
```bash
git status                      # deve estar limpo
git checkout develop && git pull origin develop
git checkout -b feature/v0.3.28
```
Baixe também o backup JSON do app pela UI (Parâmetros → Backup).

---

## Passo 1 — Copiar os arquivos
Novos:
```
src/services/transactionNormalizer.js
src/services/migrationPipeline.js
src/hooks/useTransactionsStorage.js
tests/dataModel.test.js
```
Alterados (sobrescrever):
```
src/App.jsx
src/services/cardInvoiceOperations.js
```
Não mudaram nesta versão (não precisa copiar): `cardInvoiceService.js`,
`financeRepository.js`, `useLocalStorage.js`, `dateUtils.js`, `moneyUtils.js`,
`storageKeys.js` — mas se você aplicou a v0.3.27 num branch separado, confirme
que já estão na versão dessa etapa antes de seguir.

---

## Passo 2 — Testes
```bash
npx vitest run
```
Esperado: os testes de `tests/cardInvoiceOperations.test.js` (17, da v0.3.27)
**e** de `tests/dataModel.test.js` (16, novos) passando — 33 no total.

---

## Passo 3 — Build e checklist manual
```bash
npm run build
npm run dev
```
No app:
- [ ] Fechar/reabrir/ajustar fatura — sem diferença perceptível.
- [ ] Abra o DevTools → Application → LocalStorage e confira que uma
      transação qualquer tem os dois campos preenchidos e iguais (ex.:
      `valor` e `amount` com o mesmo número).
- [ ] Se tiver dados antigos, o saldo das contas deve continuar exibindo o
      mesmo valor de antes da atualização.

---

## Passo 4 — Commit e merge
```bash
git add .
git commit -m "refactor: v0.3.28 base - consolidacao do modelo de dados (E2/E6) e pipeline de migracao (E7-conteudo)"
git tag v0.3.28-base
git checkout main && git pull origin main
git merge feature/v0.3.28
npm run build
git push origin main --tags
git checkout develop && git merge main && git push origin develop
```

---

## Passo 5 — Documentação
- Adicione `docs/v0_3_28-BASE-MODELO-DE-DADOS.md` como novo doc numerado.
- Atualize `04-MODELO-DE-DADOS-E-LOCALSTORAGE.md`: registre a decisão de campo
  canônico (português) e a existência do pipeline de migração.
- Registre em `08-REGISTRO-DE-DECISOES.md`: E2 e E6 resolvidos; E3/E4 e o
  ConfirmDialog seguem para v0.3.29.

---

## Erros comuns
- **"normalizeTransactions muda tudo a cada render"**: não deveria — a função
  só recria objetos que precisam de correção. Se isso acontecer, verifique se
  algum outro código está gerando `valor`/`amount` diferentes de propósito
  (ex.: arredondamento diferente nos dois campos).
- **Teste de `resolveInvoiceCategoryId` falhando**: confirme que `cats` (lista
  de categorias) está sendo passada, não `categorias` ou outro nome de
  variável — o nome correto no `App.jsx` é `cats`.
- **CRLF/LF**: mesma observação do pacote anterior — não rode formatador que
  normalize quebras de linha antes de commitar.
