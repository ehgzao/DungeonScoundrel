# 🎮 Dungeon Scoundrel - Development Guide

## 📁 SINGLE SOURCE OF TRUTH

**IMPORTANTE:** Toda edição de código deve ser feita APENAS em:

```
public/
├── index.html          ← HTML principal
├── src/
│   ├── js/
│   │   └── game.js     ← JavaScript principal
│   └── styles/
│       ├── styles.css
│       └── mobile.css
└── assets/
```

## 🚫 NÃO EDITAR:

- ❌ `src/` (pasta na raiz) - NÃO É SERVIDA
- ❌ Qualquer arquivo fora de `public/`

## 🖥️ Servidor Local

**Sempre usar porta 8080:**

```bash
python -m http.server 8080 --directory public
```

**Acessar:**
```
http://localhost:8080/
```

## 🔄 Workflow de Desenvolvimento

1. **Editar código** → `public/` (arquivos dentro)
2. **Testar local** → `http://localhost:8080/`
3. **Hard refresh** → `CTRL + SHIFT + R`
4. **Commit** → `git add public/` + `git commit`
5. **Deploy** → (quando pronto)

## ⚠️ IMPORTANTE

- **Sempre editar em `public/`**
- **Sempre usar porta 8080**
- **Sempre fazer hard refresh para ver mudanças**

## 🗑️ Arquivos Deletados (consolidação)

- ❌ `src/js/game.js` (duplicado - DELETADO)
- ❌ `index.html` (raiz - DELETADO)

**Única fonte de verdade:** `public/`
