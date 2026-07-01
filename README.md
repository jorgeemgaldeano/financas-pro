# Finanças PRO — Pacote localhost de reinstalação

Este pacote contém uma estrutura completa React + Vite para reinstalar e validar o ambiente local do Finanças PRO.

> Atenção: este ZIP foi gerado sem acesso ao `App.jsx` funcional mais recente. A versão incluída em `src/App.jsx` é uma tela mínima de diagnóstico para confirmar que o localhost está funcionando. Para restaurar o aplicativo completo, substitua `src/App.jsx` pela versão funcional validada do Finanças PRO.

## Como instalar

1. Descompacte o ZIP.
2. Abra a pasta no VS Code ou CMD/PowerShell.
3. Execute:

```bash
npm install
npm run dev
```

4. Acesse o endereço exibido pelo Vite, normalmente:

```txt
http://127.0.0.1:5173
```

## Validar build

```bash
npm run build
npm run preview
```

## Onde colocar a versão real do aplicativo

Substitua este arquivo:

```txt
src/App.jsx
```

pela versão validada do aplicativo, por exemplo:

```txt
App_backup_restauracao_revisado.jsx
```

renomeando o conteúdo final para `App.jsx`.

## Documentação do projeto

Os arquivos de apoio do projeto estão na pasta:

```txt
docs/
```

Inclui roadmap, regras de negócio, modelo de dados, checklist, critérios de aceite e decisões técnicas.

## Checklist mínimo após substituir o App.jsx

```bash
npm run dev
npm run build
npm run preview
```

Depois validar manualmente:

- Dashboard abre.
- Lançamentos abre.
- Contas abre.
- Cartões abre.
- Pessoas abre.
- Simulações abre.
- Importação abre.
- Parâmetros abre.
- Backup exporta corretamente.
- Backup inválido não apaga dados.
