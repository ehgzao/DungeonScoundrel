# 📧 Guia Anti-Spam para hello@dungeonscoundrel.com

## 🎯 **PROBLEMA RESOLVIDO RAPIDAMENTE**

Emails novos vão para spam porque não têm reputação. Vamos resolver isso!

---

## 🚀 **SOLUÇÃO 1: Gmail (Mais Rápido)**

### **Passo 1: Marcar como Não Spam**
```
1. Abra Gmail
2. Vá para Spam/Promotions
3. Encontre email de hello@dungeonscoundrel.com
4. Clique em "Not spam" (Não é spam)
5. Arraste para Inbox principal
```

### **Passo 2: Adicionar Contato**
```
1. Abra email de hello@dungeonscoundrel.com
2. Clique no ícone de perfil (avatar)
3. "Add to contacts" (Adicionar aos contatos)
4. Salve contato
```

### **Passo 3: Criar Filtro**
```
1. Gmail Settings > See all settings
2. Filters and Blocked Addresses > Create new filter
3. From: hello@dungeonscoundrel.com
4. Create filter
5. Marque: "Never send to spam"
6. Also apply to matching conversations
7. Create filter
```

---

## 🛡️ **SOLUÇÃO 2: DKIM (Mais Técnico)**

### **Configurar DKIM no ImprovMX:**
```
1. Acesse: https://improvmx.com
2. Seu domínio > Settings > DKIM
3. Generate DKIM keys
4. Copie o TXT record fornecido
5. Adicione ao Netlify DNS:
   Tipo: TXT
   Host: (o que o ImprovMX mostrar)
   Valor: (o DKIM key)
```

### **Registros DKIM exemplo:**
```
Tipo: TXT
Host: k1._domainkey
Valor: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

---

## 📊 **SOLUÇÃO 3: Aquecer Reputação**

### **Enviar emails teste:**
```
1. Envie 5-10 emails para diferentes contatos
2. Peça para marcarem "Not spam"
3. Use conteúdo relevante (não marketing pesado)
4. Evite links suspeitos
5. Use texto claro, sem HTML pesado
```

### **Melhores práticas:**
```
✅ Assunto claro: "Dungeon Scoundrel - Mobile Waitlist"
✅ Texto simples, sem muitos links
✅ Remetente: hello@dungeonscoundrel.com
✅ Evite palavras: GRÁTIS, OFERTA, URGENTE
✅ Inclua link de unsubscribe
```

---

## 🔍 **SOLUÇÃO 4: Verificar Blacklist**

### **Verificar se domínio está em blacklist:**
```
1. Acesse: https://mxtoolbox.com/blacklists.aspx
2. Digite: dungeonscoundrel.com
3. Verifique se aparece em alguma blacklist
4. Se aparecer, siga instruções para remoção
```

---

## 📈 **SOLUÇÃO 5: Monitorar Deliverability**

### **Ferramentas gratuitas:**
```
- Gmail: Verificar pasta Spam/Promotions
- Outlook: Verificar filtro de Junk
- Yahoo: Verificar pasta Spam
- Mail-tester.com: Testar score de spam
```

---

## 🎯 **PLANO DE AÇÃO RÁPIDO:**

### **Hoje (5 minutos):**
```
✅ Marcar emails como "Not spam"
✅ Adicionar hello@dungeonscoundrel.com aos contatos
✅ Criar filtro "Never send to spam"
```

### **Esta semana (30 minutos):**
```
✅ Configurar DKIM no ImprovMX
✅ Enviar 10 emails teste
✅ Pedir para marcarem como não spam
```

### **Resultado esperado:**
```
📧 Emails entregues na Inbox
📊 Reputação do domínio crescendo
🎯 Taxa de entrega > 95%
```

---

## 🆘 **SE CONTINUAR NO SPAM:**

### **Verificar:**
1. **SPF configurado?** ✅ (já fizemos)
2. **DKIM configurado?** 🔄 (fazer agora)
3. **Contato adicionado?** ✅ (fazer agora)
4. **Filtro criado?** ✅ (fazer agora)
5. **Blacklist?** 🔄 (verificar)

---

## 📞 **CONTATO SUPORTE:**

### **Se precisar de ajuda:**
- **ImprovMX:** support@improvmx.com
- **Netlify:** help@netlify.com
- **Gmail:** Não tem suporte direto, mas use as configurações

---

## 🎉 **RESULTADO FINAL:**

### **Quando funcionar:**
```
📧 hello@dungeonscoundrel.com → Inbox (não Spam)
🔒 Domínio com boa reputação
📊 Emails entregues corretamente
🎮 Sistema profissional funcionando!
```

**Siga estes passos e em 1-2 dias o email estará funcionando perfeitamente!** 🚀
