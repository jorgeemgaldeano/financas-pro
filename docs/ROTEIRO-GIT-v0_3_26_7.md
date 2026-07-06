# Roteiro Git — Hotfix v0.3.26.7

Pré-requisito: partir de `develop` já com a v0.3.26.6 mergeada em `main`
(conforme roteiro do doc 35).

```bash
# 1. Garantir base limpa
git checkout develop
git pull origin develop

# 2. Aplicar os arquivos de src/ deste pacote sobre o projeto
#    (copiar preservando a estrutura de pastas)

# 3. Build de verificação
npm run build

# 4. Commit do hotfix
git add .
git commit -m "fix: hotfix v0.3.26.7 - fuso na competencia (E1), migracao de prefixo de schema (E7), import faltante (E8), uid seguro (E5) e aviso de falha de persistencia (L6)"
git tag v0.3.26.7
git push origin develop
git push origin v0.3.26.7

# 5. Levar para produção
git checkout main
git pull origin main
git merge develop
npm run build
git push origin main
git checkout develop
```

## Após o merge
- Colar a entrada de `CHANGELOG-ENTRADA-v0_3_26_7.md` no `09-CHANGELOG.md`.
- Registrar no `08-REGISTRO-DE-DECISOES.md` a decisão de blindar o versionamento
  de schema (E7) e de manter E2 para a v0.3.28.
- Seguir para a preparação da v0.3.27 (isolamento de fatura) conforme doc 35.
