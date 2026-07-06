# Roteiro Git — Publicar v0.3.26.6 aprovada

## Objetivo

Atualizar o repositório com a versão aprovada `v0.3.26.6`, manter `develop` como branch de evolução e promover a versão estável para `main`.

## 1. Confirmar branch atual

```bash
git branch
```

Se estiver em `develop`, siga. Se não estiver:

```bash
git checkout develop
```

## 2. Conferir alterações

```bash
git status
```

## 3. Adicionar arquivos

```bash
git add .
```

## 4. Commit da versão aprovada

```bash
git commit -m "feat: aprova v0.3.26.6 com painel de divergencias de parcelamento"
```

Se aparecer mensagem de que não há nada para commitar, significa que o commit já foi feito.

## 5. Criar tag

```bash
git tag v0.3.26.6
```

Se a tag já existir, validar com:

```bash
git tag
```

## 6. Subir develop e tag

```bash
git push origin develop
git push origin v0.3.26.6
```

## 7. Promover para main

```bash
git checkout main
git pull origin main
git merge develop
```

## 8. Validar na main

```bash
npm run build
```

Opcional:

```bash
npm run dev
```

## 9. Subir main

```bash
git push origin main
```

## 10. Voltar para develop

```bash
git checkout develop
```

## Estado esperado

- `main`: v0.3.26.6 aprovada e estável.
- `develop`: pronta para iniciar v0.3.27.
- tag: `v0.3.26.6` criada no repositório remoto.
