# 📊 Guia de Automação de Emails para Planilhas

## 🎯 Objetivo
Automatizar a coleta de **bug reports** e **waitlist signups** dos emails recebidos e organizá-los em planilhas Google Sheets.

---

## 🚀 OPÇÃO 1: Google Apps Script (RECOMENDADO)

### ✅ Vantagens:
- 🆓 **100% Gratuito** - Sem limites
- ⚡ **Rápido** - Executa a cada 5 minutos
- 🔧 **Customizável** - Código aberto
- 📊 **Integração nativa** - Google Sheets

### 📋 Passo a Passo:

#### 1️⃣ Criar Planilha Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie nova planilha: **"Dungeon Scoundrel - Data"**
3. Crie duas abas:
   - `Bug Reports`
   - `Mobile Waitlist`
4. Copie o **ID da planilha** da URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
   ```

#### 2️⃣ Configurar Apps Script

1. Na planilha, vá em: **Extensions > Apps Script**
2. Delete o código padrão
3. Cole o código do arquivo: `scripts/google-apps-script-automation.js`
4. **IMPORTANTE:** Edite a linha 18:
   ```javascript
   SPREADSHEET_ID: 'COLE_AQUI_O_ID_DA_SUA_PLANILHA',
   ```
5. Salve o projeto (Ctrl+S): **"Dungeon Scoundrel Automation"**

#### 3️⃣ Executar Setup Inicial

1. No Apps Script, selecione a função: `setupTrigger`
2. Clique em **Run** (▶️)
3. Autorize as permissões:
   - Acesso ao Gmail
   - Acesso ao Google Sheets
4. Aguarde a mensagem: ✅ "Execution completed"

#### 4️⃣ Testar o Script

1. Selecione a função: `testScript`
2. Clique em **Run** (▶️)
3. Verifique os logs (View > Logs)
4. Abra a planilha e veja se os dados foram importados

#### 5️⃣ Pronto! 🎉

- O script executará **automaticamente a cada 5 minutos**
- Emails não lidos serão processados
- Dados serão adicionados às planilhas
- Emails processados serão marcados como lidos

---

## 🚀 OPÇÃO 2: Zapier (Mais Fácil, Mas Limitado)

### ✅ Vantagens:
- 🎨 **Interface visual** - Sem código
- 🔄 **Fácil de configurar** - Drag & drop
- 📊 **Múltiplas integrações** - 5000+ apps

### ❌ Desvantagens:
- 💰 **Plano gratuito limitado** - 100 tarefas/mês
- 🐌 **Mais lento** - Executa a cada 15 minutos

### 📋 Passo a Passo:

#### 1️⃣ Criar Conta Zapier

1. Acesse [zapier.com](https://zapier.com)
2. Crie conta gratuita
3. Clique em **Create Zap**

#### 2️⃣ Configurar Zap para Bug Reports

**Trigger:**
```
App: Gmail
Event: New Email Matching Search
Search String: from:lima.ehg@gmail.com subject:"BUG FOUND"
```

**Action:**
```
App: Google Sheets
Event: Create Spreadsheet Row
Spreadsheet: Dungeon Scoundrel - Data
Worksheet: Bug Reports
Campos:
  - Data: {{Date}}
  - Email: {{From}}
  - Assunto: {{Subject}}
  - Corpo: {{Body Plain}}
```

#### 3️⃣ Configurar Zap para Waitlist

**Trigger:**
```
App: Gmail
Event: New Email Matching Search
Search String: from:lima.ehg@gmail.com subject:"Mobile Waitlist"
```

**Action:**
```
App: Google Sheets
Event: Create Spreadsheet Row
Spreadsheet: Dungeon Scoundrel - Data
Worksheet: Mobile Waitlist
Campos:
  - Data: {{Date}}
  - Email: (extrair do corpo)
  - Device: (extrair do corpo)
```

#### 4️⃣ Ativar Zaps

1. Teste cada Zap
2. Ative ambos
3. Pronto! 🎉

---

## 🚀 OPÇÃO 3: Make (Integromat) - Mais Poderoso

### ✅ Vantagens:
- 🚀 **Mais flexível** que Zapier
- 🔧 **Parsing avançado** de emails
- 📊 **Múltiplas ações** por trigger
- 🆓 **1000 operações/mês** grátis

### 📋 Configuração:

Similar ao Zapier, mas com mais opções de transformação de dados.

1. Acesse [make.com](https://make.com)
2. Crie conta gratuita
3. Configure scenarios similares aos Zaps acima

---

## 📊 Estrutura das Planilhas

### Bug Reports
| Data/Hora | Email | Mensagem | Browser | Versão | OS | Resolução | Viewport | Device | Pixel Ratio | Versão Jogo |
|-----------|-------|----------|---------|--------|----|-----------|---------|---------|-----------|-----------  |
| 11/9/2025 | user@email.com | Bug description... | Chrome | 130 | Windows 10/11 | 1920x1080 | 1200x800 | Desktop | 1.5 | v1.4.0 |

### Mobile Waitlist
| Data/Hora | Email | Privacy | Marketing | Device Info | Screen Size | Status | Notas |
|-----------|-------|---------|-----------|-------------|-------------|--------|-------|
| 11/9/2025 | user@email.com | Yes | Yes | iPhone 15 Pro... | 393x852 | Pending | - |

---

## 🎯 Comparação das Opções

| Recurso | Google Apps Script | Zapier | Make |
|---------|-------------------|--------|------|
| **Preço** | 🆓 Grátis | 💰 $19.99/mês | 💰 $9/mês |
| **Limite Grátis** | ♾️ Ilimitado | 100 tarefas/mês | 1000 ops/mês |
| **Frequência** | ⚡ 5 minutos | 🐌 15 minutos | ⚡ 5 minutos |
| **Customização** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Facilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Parsing** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recomendação Final

### Para você, recomendo: **Google Apps Script**

**Por quê?**
- ✅ **Grátis e ilimitado** - Perfeito para começar
- ✅ **Parsing preciso** - Extrai todos os campos corretamente
- ✅ **Rápido** - Executa a cada 5 minutos
- ✅ **Customizável** - Pode adicionar mais features depois
- ✅ **Sem dependências** - Tudo no Google

---

## 🆘 Troubleshooting

### Problema: Script não executa
**Solução:** Verifique se o trigger foi criado em `Triggers` (ícone de relógio)

### Problema: Erro de permissões
**Solução:** Execute `setupTrigger` novamente e autorize todas as permissões

### Problema: Dados não aparecem
**Solução:** 
1. Verifique o SPREADSHEET_ID
2. Execute `testScript` e veja os logs
3. Verifique se há emails não lidos com os filtros corretos

### Problema: Duplicatas
**Solução:** O script já previne duplicatas na waitlist. Para bug reports, você pode adicionar verificação similar.

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no Apps Script (View > Logs)
2. Execute `testScript` para debug
3. Ajuste os filtros de busca se necessário

---

## 🎉 Resultado Final

Após configurar, você terá:
- 📊 **Planilha centralizada** com todos os dados
- 🔄 **Atualização automática** a cada 5 minutos
- 📧 **Emails organizados** e marcados como lidos
- 📈 **Análise fácil** de bugs e waitlist
- 🆓 **Tudo grátis** e ilimitado!

**Boa sorte!** 🚀
