# ✅ VERIFICAÇÃO DE AUTOR - Gabriel Lima

## 🎯 Objetivo
Garantir que TODOS os commits sejam com o nome correto: **Gabriel Lima** (lima.ehg@gmail.com)

---

## 📋 Status Atual

### ✅ Configuração Local
```bash
git config user.name   # Gabriel Lima
git config user.email  # lima.ehg@gmail.com
```

### ✅ Configuração Global
```bash
git config --global user.name   # Gabriel Lima
git config --global user.email  # lima.ehg@gmail.com
```

---

## 🔧 Como Corrigir Histórico Antigo (se necessário)

### Opção 1: Reescrever TODO o histórico (CUIDADO!)
```bash
# Execute APENAS se tiver commits antigos com nome errado
git filter-branch -f --env-filter '
OLD_NAME="Eduardo Lima"
CORRECT_NAME="Gabriel Lima"
CORRECT_EMAIL="lima.ehg@gmail.com"

if [ "$GIT_COMMITTER_NAME" = "$OLD_NAME" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_NAME" = "$OLD_NAME" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

### Opção 2: Corrigir apenas os últimos N commits
```bash
# Substitua N pelo número de commits a corrigir
git rebase -i HEAD~N

# No editor, marque os commits como "edit"
# Para cada commit:
git commit --amend --author="Gabriel Lima <lima.ehg@gmail.com>" --no-edit
git rebase --continue
```

### ⚠️ IMPORTANTE: Após reescrever histórico
```bash
# FORCE PUSH (cuidado se outras pessoas usam o repo!)
git push --force-with-lease origin <branch-name>
```

---

## 🛡️ Proteção Automática (Hook Instalado)

### Pre-Commit Hook
Um hook foi instalado em `.git/hooks/pre-commit.ps1` que:
- ✅ Verifica o nome e email antes de CADA commit
- 🔧 Corrige automaticamente se estiver errado
- 🚫 IMPEDE commits com nome errado

### Como testar o hook:
```bash
# Simular nome errado
git config user.name "Nome Errado"

# Tentar fazer commit (o hook vai corrigir automaticamente)
git commit -m "teste"

# Verificar que foi corrigido
git config user.name  # Deve mostrar: Gabriel Lima
```

---

## 📊 Verificar Commits Recentes

### Ver últimos 10 commits com autor:
```bash
git log --pretty=format:"%h - %an (%ae) - %s" -10
```

### Ver todos os autores no repositório:
```bash
git log --format='%an <%ae>' | sort -u
```

### Contar commits por autor:
```bash
git shortlog -sn
```

---

## 🚨 Se Aparecer "Eduardo Lima" Novamente

### 1. Verificar configuração:
```bash
git config user.name
git config --global user.name
```

### 2. Se estiver errado, corrigir:
```bash
git config user.name "Gabriel Lima"
git config user.email "lima.ehg@gmail.com"
```

### 3. Corrigir o último commit:
```bash
git commit --amend --author="Gabriel Lima <lima.ehg@gmail.com>" --no-edit
```

---

## ✅ Checklist de Verificação

- [x] Configuração local correta
- [x] Configuração global correta
- [x] Hook de pre-commit instalado
- [x] Últimos 10 commits estão corretos
- [ ] Histórico completo verificado
- [ ] Force push feito (se necessário)

---

## 🎯 Autor Correto

```
Nome:  Gabriel Lima
Email: lima.ehg@gmail.com
```

**NUNCA use "Eduardo Lima"!**

---

## 📞 Dúvidas?

Se ainda aparecer "Eduardo Lima":
1. Execute: `git config --list | grep user`
2. Verifique se há `.gitconfig` em outras pastas
3. Verifique configuração do VS Code / GitHub Desktop
4. Execute o hook manualmente: `.git/hooks/pre-commit.ps1`
