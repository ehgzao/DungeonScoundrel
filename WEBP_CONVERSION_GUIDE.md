# 🖼️ GUIA DE CONVERSÃO WEBP - Método Manual (Squoosh)

**Tempo estimado**: 10-15 minutos  
**Ferramenta**: Squoosh.app (Google - Gratuito, Online)

---

## 📋 IMAGENS PARA CONVERTER

Total: **8 imagens JPG** (~10 MB)

### Lista Completa:
```
assets/images/
├── avatar-scoundrel.jpg  (~ 1.2 MB)
├── avatar-knight.jpg     (~ 1.2 MB)
├── avatar-rogue.jpg      (~ 1.2 MB)
├── avatar-dancer.jpg     (~ 1.2 MB)
├── avatar-berserker.jpg  (~ 1.2 MB)
├── avatar-priest.jpg     (~ 1.2 MB)
├── dungeon-bg.jpg        (~ 2.5 MB)
└── title-logo.png        (~ 500 KB)
```

**Total Atual**: ~10 MB  
**Total Esperado (WebP)**: ~3 MB  
**Economia**: **-70%** 🎉

---

## 🚀 MÉTODO 1: Squoosh.app (RECOMENDADO - FÁCIL)

### Passo 1: Abrir Squoosh
```
https://squoosh.app/
```

### Passo 2: Arrastar Todas as Imagens
1. Abra o explorador de arquivos
2. Navegue até: `assets\images\`
3. Selecione todos os `.jpg` e `.png`
4. Arraste para a janela do Squoosh

### Passo 3: Configurar WebP
**Para cada imagem**:
1. No lado direito, escolha **WebP**
2. Ajuste **Quality**: `85` (ótimo balanço)
3. Clique em **Download** (ícone de download)

### Passo 4: Renomear e Organizar
Os arquivos vão baixar como:
- `avatar-scoundrel (1).webp` → Renomear para `avatar-scoundrel.webp`
- Mover todos para `assets\images\`

---

## 🖥️ MÉTODO 2: Batch Converter Online

### Cloudconvert.com
```
https://cloudconvert.com/jpg-to-webp
```

1. Upload de múltiplos arquivos
2. Converter todos de uma vez
3. Download como ZIP
4. Extrair para `assets\images\`

---

## 🛠️ MÉTODO 3: Instalar cwebp (Windows)

### Via Chocolatey (Requer Admin)
```powershell
# Instalar Chocolatey primeiro (se não tiver):
# https://chocolatey.org/install

# Depois instalar webp:
choco install webp
```

### Download Manual
```
https://developers.google.com/speed/webp/download

1. Baixar "libwebp-1.x.x-windows-x64.zip"
2. Extrair
3. Adicionar ao PATH ou usar direto
4. Rodar: .\convert-to-webp.ps1
```

---

## ✅ APÓS A CONVERSÃO

### Passo 1: Verificar Arquivos
Você deve ter:
```
assets/images/
├── avatar-scoundrel.jpg
├── avatar-scoundrel.webp    ← NOVO
├── avatar-knight.jpg
├── avatar-knight.webp        ← NOVO
├── ... (continua)
```

### Passo 2: Atualizar HTML

Vou atualizar o HTML para usar `<picture>` com fallback:

**Localização**: `public/index.html`

**Trocar de**:
```html
<img src="assets/images/avatar-knight.jpg" alt="Knight">
```

**Para**:
```html
<picture>
  <source srcset="assets/images/avatar-knight.webp" type="image/webp">
  <img src="assets/images/avatar-knight.jpg" alt="Knight" style="...">
</picture>
```

### Passo 3: Background WebP

**CSS Background** (linha 157):
```css
background: 
  url('assets/images/dungeon-bg.webp') center center / cover no-repeat,
  linear-gradient(180deg, #1a1410 0%, #0d0a08 50%, #000000 100%);
```

Com fallback no CSS:
```css
/* Fallback JPG */
background: url('assets/images/dungeon-bg.jpg') center center / cover;

/* WebP se suportado */
background: url('assets/images/dungeon-bg.webp') center center / cover;
```

---

## 📊 RESULTADOS ESPERADOS

### Antes (JPG/PNG)
```
avatar-berserker.jpg:  1.2 MB
avatar-knight.jpg:     1.2 MB
avatar-rogue.jpg:      1.2 MB
avatar-dancer.jpg:     1.2 MB
avatar-scoundrel.jpg:  1.2 MB
avatar-priest.jpg:     1.2 MB
dungeon-bg.jpg:        2.5 MB
title-logo.png:        0.5 MB
────────────────────────────
TOTAL:                ~10 MB
```

### Depois (WebP)
```
avatar-berserker.webp:  300 KB (-75%)
avatar-knight.webp:     300 KB (-75%)
avatar-rogue.webp:      300 KB (-75%)
avatar-dancer.webp:     300 KB (-75%)
avatar-scoundrel.webp:  300 KB (-75%)
avatar-priest.webp:     300 KB (-75%)
dungeon-bg.webp:        800 KB (-68%)
title-logo.webp:        150 KB (-70%)
────────────────────────────
TOTAL:                 ~3 MB
````

**Economia Total**: **-7 MB (-70%)** 🎉

---

## 🧪 TESTAR

### Navegadores que Suportam WebP
- ✅ Chrome/Edge (2010+)
- ✅ Firefox (2019+)
- ✅ Safari (2020+)
- ✅ Opera (2012+)

**Cobertura**: ~97% dos usuários

### Fallback Automático
O código `<picture>` automaticamente usa JPG se WebP não for suportado.

---

## 🚀 AUTOMAÇÃO (Se quiser instalar cwebp)

### Depois de instalar cwebp:
```powershell
cd scripts
.\convert-to-webp.ps1
```

O script faz tudo automaticamente! 🎉

---

## 📝 CHECKLIST

- [ ] Abrir Squoosh.app
- [ ] Arrastar 8 imagens
- [ ] Configurar WebP quality 85
- [ ] Download de todas
- [ ] Mover para `assets\images\`
- [ ] Verificar que ficaram ~70% menores
- [ ] ✋ **PARAR AQUI** - Me avisar!
- [ ] Vou atualizar o HTML automaticamente
- [ ] Testar local
- [ ] Commit

---

## 💡 DICA

**Não delete os JPG originais ainda!**  
Mantenha ambos (JPG + WebP) para:
1. Fallback automático
2. Backup
3. Compatibilidade

---

**PRONTO PARA COMEÇAR?** 🚀

1. Abra: https://squoosh.app/
2. Arraste os 8 arquivos de `assets\images\`
3. Configure WebP quality 85
4. Download todos
5. Coloque na pasta `assets\images\`
6. **ME AVISE** que terminou!

Eu vou automaticamente atualizar o HTML para usar as versões WebP! ⚡
