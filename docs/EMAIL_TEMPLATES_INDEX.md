# 📧 Email Templates - Index

## 🎯 **TEMPLATES ATIVOS**

### **1. Bug Report + Contact (Unificado)**
**Arquivo:** `FINAL-unified-email-template.html`  
**EmailJS Template ID:** `template_x3cplm6`  
**Uso:** Bug reports E mensagens de contato

**Variáveis:**
- `message_type` - "BUG_REPORT" ou "CONTACT"
- `message_type_bug` - "block" ou "none"
- `message_type_contact` - "block" ou "none"
- `from_name` - Nome do usuário
- `reply_to` - Email do usuário
- `message` - Mensagem/bug description
- `browser_name`, `browser_version`, `browser_os` - Info técnica
- `user_screen`, `screen_viewport`, `screen_device` - Info de tela
- `game_version` - Versão do jogo
- `contact_subject` - Tipo de contato (feedback/suggestion/etc)

**Features:**
- ✅ Logo do jogo no header
- ✅ Renderização condicional por tipo
- ✅ Badges visuais (BUG REPORT / CONTACT MESSAGE)
- ✅ Informações técnicas completas
- ✅ Design temático medieval

---

### **2. Mobile Waitlist**
**Arquivo:** `FINAL-waitlist-email-template.html`  
**EmailJS Template ID:** (seu template de waitlist)  
**Uso:** Signups da waitlist mobile

**Variáveis:**
- `user_email` - Email do signup
- `privacy_accepted` - Aceitou política de privacidade
- `marketing_accepted` - Aceitou marketing
- `device_info` - User agent
- `screen_size` - Resolução da tela
- `signup_date` - Data do signup

**Features:**
- ✅ Logo do jogo no header
- ✅ Design limpo e profissional
- ✅ Informações de consents LGPD
- ✅ Device info para análise

---

## 📝 **GUIAS RELACIONADOS**

- **Setup EmailJS:** `EMAIL_AUTOMATION_GUIDE.md`
- **Anti-Spam:** `ANTI_SPAM_GUIDE.md`
- **Gmail Filters:** `GMAIL_FILTER_SETUP.md`
- **Google Sheets:** `../scripts/google-apps-script-automation.js`

---

## ⚠️ **LINT WARNINGS**

**IMPORTANTE:** Os templates HTML têm avisos de lint do CSS linter.

**Estes são FALSOS POSITIVOS** e devem ser **IGNORADOS**.

**Motivo:** O linter não reconhece sintaxe Handlebars ({{variáveis}}) dentro de CSS inline.

**Documentação completa:** `.lintignore-explanation.md`

---

## 🔄 **COMO ATUALIZAR TEMPLATES**

### **1. Editar arquivo local:**
```
docs/FINAL-unified-email-template.html
ou
docs/FINAL-waitlist-email-template.html
```

### **2. Copiar para EmailJS:**
```
1. Abra o arquivo
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. EmailJS Dashboard > Templates
4. Cole no template correspondente
5. Save
```

### **3. Testar:**
```
1. Envie email teste do site
2. Verifique se renderizou corretamente
3. Confirme que variáveis foram substituídas
```

---

## 🎨 **CUSTOMIZAÇÃO**

### **Logo/Avatar:**
Atualmente usa: `https://www.dungeonscoundrel.com/favicon.svg`

Para mudar:
1. Upload nova imagem para `/public/`
2. Atualizar URL no template:
   ```html
   <img src="https://www.dungeonscoundrel.com/SEU-LOGO.png">
   ```

### **Cores:**
Tema atual: Medieval (dourado, marrom, verde)

Para mudar, edite as classes CSS no `<style>`:
- `.bug-alert` - Vermelho (bugs)
- `.contact-alert` - Azul (contato)
- `.label` - Verde (labels)
- `.type-badge` - Badges de tipo

---

## 📊 **ESTATÍSTICAS**

- **Templates ativos:** 2
- **Variáveis totais:** ~25
- **Tamanho médio:** ~6KB
- **Compatibilidade:** EmailJS, Gmail, Outlook, Yahoo

---

## 🚀 **PRÓXIMAS MELHORIAS**

### **Possíveis adições futuras:**
- [ ] Template para newsletters
- [ ] Template para notificações de update
- [ ] Template para confirmação de email
- [ ] Versão mobile-optimized
- [ ] Dark mode toggle

---

**Última atualização:** 09/11/2025  
**Autor:** Gabriel Lima  
**Projeto:** Dungeon Scoundrel
