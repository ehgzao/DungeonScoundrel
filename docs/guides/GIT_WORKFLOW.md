# 🔧 Git Workflow Guide

**Dungeon Scoundrel** - Guia de comandos Git

---

## 🚀 COMANDOS BÁSICOS

### **1. Verificar Status**
```bash
git status
```
Mostra quais arquivos foram modificados, adicionados ou deletados.

---

### **2. Adicionar Arquivos**

**Adicionar TODOS os arquivos:**
```bash
git add .
```

**Adicionar arquivos específicos:**
```bash
git add index.html
git add src/styles/styles.css
git add docs/
```

**Adicionar por padrão:**
```bash
git add *.md          # Todos arquivos .md
git add assets/*.jpg  # Todas imagens .jpg
```

---

### **3. Fazer Commit**

**Commit simples:**
```bash
git commit -m "Descrição curta da mudança"
```

**Commit detalhado:**
```bash
git commit -m "Título curto

- Mudança 1
- Mudança 2
- Mudança 3"
```

**Commit com múltiplas linhas (nosso último):**
```bash
git commit -m "v1.0.0 - Major Release: Features + Fixes

✨ Features:
- Feature 1
- Feature 2

🐛 Bug Fixes:
- Fix 1
- Fix 2

📚 Documentation:
- Doc 1"
```

---

### **4. Enviar para GitHub (Push)**

**Branch principal (main):**
```bash
git push origin main
```

**Forçar push (cuidado!):**
```bash
git push -f origin main
```

---

### **5. Atualizar do GitHub (Pull)**

```bash
git pull origin main
```

---

## 📝 WORKFLOW COMPLETO

### **Fluxo Normal de Trabalho:**

```bash
# 1. Verificar status
git status

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "Descrição das mudanças"

# 4. Enviar para GitHub
git push origin main
```

---

## 🌿 TRABALHANDO COM BRANCHES

### **Criar Nova Branch:**
```bash
git checkout -b feature/nova-funcionalidade
```

### **Listar Branches:**
```bash
git branch
```

### **Mudar de Branch:**
```bash
git checkout main
git checkout feature/nova-funcionalidade
```

### **Merge de Branch:**
```bash
# Voltar para main
git checkout main

# Fazer merge
git merge feature/nova-funcionalidade
```

### **Deletar Branch:**
```bash
git branch -d feature/nova-funcionalidade
```

---

## 🔄 DESFAZER MUDANÇAS

### **Desfazer arquivo não commitado:**
```bash
git restore index.html
```

### **Desfazer último commit (mantém mudanças):**
```bash
git reset --soft HEAD~1
```

### **Desfazer último commit (descarta mudanças):**
```bash
git reset --hard HEAD~1
```

### **Desfazer arquivo já adicionado (unstage):**
```bash
git restore --staged index.html
```

---

## 📋 VERIFICAR HISTÓRICO

### **Ver commits:**
```bash
git log
```

### **Ver commits resumidos:**
```bash
git log --oneline
```

### **Ver últimos 5 commits:**
```bash
git log -5
```

### **Ver mudanças de um commit:**
```bash
git show e4caf68
```

---

## 🏷️ TAGS (VERSÕES)

### **Criar tag:**
```bash
git tag v1.0.0
```

### **Criar tag com mensagem:**
```bash
git tag -a v1.0.0 -m "First major release"
```

### **Listar tags:**
```bash
git tag
```

### **Push de tags:**
```bash
git push origin v1.0.0
git push origin --tags  # Todas tags
```

---

## 🔍 COMANDOS ÚTEIS

### **Ver diferenças:**
```bash
git diff                    # Mudanças não staged
git diff --staged           # Mudanças staged
git diff main feature/test  # Entre branches
```

### **Ver quem modificou cada linha:**
```bash
git blame index.html
```

### **Limpar arquivos não rastreados:**
```bash
git clean -n   # Preview
git clean -f   # Executar
```

### **Ver remote:**
```bash
git remote -v
```

---

## 📦 .gitignore

### **Exemplo de .gitignore:**
```
# Node modules
node_modules/

# Build
dist/
build/

# Env files
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Logs
*.log
npm-debug.log*
```

---

## 🚨 EMERGÊNCIAS

### **Erro ao fazer push:**
```bash
# Se alguém fez push antes de você
git pull origin main
git push origin main
```

### **Conflitos de merge:**
```bash
# 1. Resolver conflitos nos arquivos
# 2. Adicionar arquivos resolvidos
git add .
# 3. Continuar merge
git commit
```

### **Voltar para commit específico:**
```bash
git checkout e4caf68
```

---

## ✅ BOAS PRÁTICAS

### **Commits:**
- ✅ Fazer commits pequenos e frequentes
- ✅ Mensagens descritivas
- ✅ Usar verbos no imperativo ("Add", "Fix", "Update")
- ✅ Separar features em commits diferentes

### **Branches:**
- ✅ `main` - Produção estável
- ✅ `develop` - Desenvolvimento ativo
- ✅ `feature/nome` - Nova funcionalidade
- ✅ `fix/nome` - Correção de bug
- ✅ `hotfix/nome` - Correção urgente

### **Mensagens de Commit:**
```
✨ feat: Nova funcionalidade
🐛 fix: Correção de bug
📚 docs: Documentação
💄 style: Formatação/estilo
♻️ refactor: Refatoração
⚡ perf: Performance
✅ test: Testes
🔧 chore: Manutenção
```

---

## 📊 NOSSO ÚLTIMO COMMIT

```bash
git add .

git commit -m "v1.0.0 - Major Release: 6 Classes + Desktop Optimization + Professional Organization

✨ Features:
- Added 6 playable classes
- Implemented keyboard shortcuts
- Created interactive tutorial

⚡ Performance:
- Desktop optimization
- Particle limit system
- Optimized iterations

🔒 Security:
- Input sanitization
- LocalStorage error handling

📁 Organization:
- Reorganized 40+ docs
- Professional folder structure
- Added CHANGELOG.md

🐛 Bug Fixes:
- Fixed sanitization
- Fixed storage crashes

📚 Documentation:
- Complete structure docs
- Updated README"

git push origin main
```

**Resultado:**
- ✅ 59 files changed
- ✅ 8,818 insertions(+)
- ✅ 453 deletions(-)
- ✅ Commit ID: `e4caf68`

---

## 🔗 LINKS ÚTEIS

- **GitHub Desktop:** https://desktop.github.com/
- **Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

*Git Workflow Guide - October 26, 2025* 🔧
