# Manifesto do pacote — Finanças PRO v0.3.19

Gerado em: 2026-07-04

## Código

- `src/App.jsx` — versão principal `v0.3.19` para substituir no projeto.
- `App_v0_3_19.jsx` — cópia versionada da mesma versão.
- `src/services/projectionService.js` — novo service de cálculo de projeções.
- `src/services/financeRepository.js` — mantido da `v0.3.18`.
- `src/hooks/useLocalStorage.js` — mantido da `v0.3.18`.

## Documentação atualizada

- `09-CHANGELOG.md`
- `07-ROADMAP-E-BACKLOG.md`
- `08-REGISTRO-DE-DECISOES.md`
- `CHANGELOG-v0.3.19.md`
- `MANIFESTO-v0.3.19.md`
- `17-RETOMADA-2026-07-04-POS-v0.3.19.md`

## Escopo da v0.3.19

- Extração conservadora do cálculo de Projeções para `projectionService.js`.
- Manutenção da regra atual de média mensal de despesas fixas e variáveis.
- Redução de responsabilidade do `App.jsx`.
- Sem alteração de LocalStorage.
- Sem migração de dados.
- Sem nova biblioteca.

## Validação obrigatória

```bash
npm run dev
npm run build
npm run preview
```

## Testes manuais mínimos

- Abrir aplicação sem tela branca.
- Confirmar versão visual `v0.3.19`.
- Abrir aba **Projeções**.
- Confirmar que os valores continuam coerentes com a `v0.3.18`.
- Criar despesa fixa e validar projeção.
- Criar despesa variável e validar projeção.
- Alterar quantidade de meses em Parâmetros.
- Recarregar página e confirmar dados preservados.
