/**
 * DUNGEON SCOUNDREL - EMAIL TO SHEETS AUTOMATION
 * 
 * Este script automatiza a coleta de bug reports e waitlist signups
 * dos emails recebidos e os organiza em planilhas Google Sheets.
 * 
 * COMO USAR:
 * 1. Abra Google Sheets
 * 2. Crie uma planilha: "Dungeon Scoundrel - Data"
 * 3. Crie duas abas: "Bug Reports" e "Mobile Waitlist"
 * 4. Vá em Extensions > Apps Script
 * 5. Cole este código
 * 6. Configure o trigger (ver instruções abaixo)
 * 7. Autorize as permissões
 */

// ============================================
// CONFIGURAÇÕES
// ============================================

const CONFIG = {
  // ID da sua planilha (pegar da URL)
  SPREADSHEET_ID: 'COLE_AQUI_O_ID_DA_SUA_PLANILHA',
  
  // Nomes das abas
  BUG_REPORTS_SHEET: 'Bug Reports',
  WAITLIST_SHEET: 'Mobile Waitlist',
  
  // Labels do Gmail (criar no Gmail)
  PROCESSED_LABEL: 'Processed/DungeonScoundrel',
  
  // Filtros de busca
  BUG_REPORT_SEARCH: 'from:lima.ehg@gmail.com subject:"BUG FOUND" is:unread',
  WAITLIST_SEARCH: 'from:lima.ehg@gmail.com subject:"Mobile Waitlist" is:unread'
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

function processEmails() {
  console.log('🚀 Starting email processing...');
  
  processBugReports();
  processWaitlistSignups();
  
  console.log('✅ Email processing complete!');
}

// ============================================
// BUG REPORTS
// ============================================

function processBugReports() {
  console.log('🐛 Processing bug reports...');
  
  const threads = GmailApp.search(CONFIG.BUG_REPORT_SEARCH);
  const sheet = getSheet(CONFIG.BUG_REPORTS_SHEET);
  
  // Criar cabeçalhos se não existirem
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data/Hora',
      'Email Usuário',
      'Mensagem',
      'Browser',
      'Versão Browser',
      'Sistema Operacional',
      'Resolução Tela',
      'Viewport',
      'Tipo Dispositivo',
      'Pixel Ratio',
      'Versão Jogo',
      'Email Completo'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#ffd700');
  }
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      if (message.isUnread()) {
        const bugData = parseBugReport(message);
        sheet.appendRow(bugData);
        message.markRead();
        console.log(`✅ Bug report processed: ${bugData[2].substring(0, 50)}...`);
      }
    });
  });
  
  console.log(`📊 Processed ${threads.length} bug report threads`);
}

function parseBugReport(message) {
  const body = message.getPlainBody();
  const date = message.getDate();
  
  // Extrair dados usando regex
  const userEmail = extractField(body, /Copy sent to:\s*([^\s]+@[^\s]+)/i) || 
                   extractField(body, /user_email[:\s]+([^\s]+@[^\s]+)/i) || 
                   'N/A';
  
  const bugMessage = extractField(body, /Bug Description:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i) || 
                    extractField(body, /message[:\s]+"([^"]+)"/i) ||
                    'N/A';
  
  const browserName = extractField(body, /Browser:\s*([^\n]+)/i) || 'N/A';
  const browserVersion = extractField(body, /browser_version[:\s]+([^\s,\n]+)/i) || 'N/A';
  const os = extractField(body, /Operating System:\s*([^\n]+)/i) || 'N/A';
  const screenRes = extractField(body, /Screen Resolution:\s*([^\n]+)/i) || 'N/A';
  const viewport = extractField(body, /Browser Window:\s*([^\n]+)/i) || 'N/A';
  const deviceType = extractField(body, /Device Type:\s*([^\n]+)/i) || 'N/A';
  const pixelRatio = extractField(body, /Pixel Ratio:\s*([^\n]+)/i) || 'N/A';
  const gameVersion = extractField(body, /Version\s+([^\s]+)/i) || 'v1.4.0';
  
  return [
    date,
    userEmail,
    bugMessage,
    browserName,
    browserVersion,
    os,
    screenRes,
    viewport,
    deviceType,
    pixelRatio,
    gameVersion,
    body.substring(0, 500) // Email completo (primeiros 500 chars)
  ];
}

// ============================================
// WAITLIST SIGNUPS
// ============================================

function processWaitlistSignups() {
  console.log('📱 Processing waitlist signups...');
  
  const threads = GmailApp.search(CONFIG.WAITLIST_SEARCH);
  const sheet = getSheet(CONFIG.WAITLIST_SHEET);
  
  // Criar cabeçalhos se não existirem
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data/Hora',
      'Email',
      'Privacy Accepted',
      'Marketing Accepted',
      'Device Info',
      'Screen Size',
      'Status',
      'Notas'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#6bcf7f');
  }
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      if (message.isUnread()) {
        const waitlistData = parseWaitlistSignup(message);
        
        // Verificar duplicatas
        if (!isDuplicate(sheet, waitlistData[1])) {
          sheet.appendRow(waitlistData);
          console.log(`✅ Waitlist signup processed: ${waitlistData[1]}`);
        } else {
          console.log(`⚠️ Duplicate signup ignored: ${waitlistData[1]}`);
        }
        
        message.markRead();
      }
    });
  });
  
  console.log(`📊 Processed ${threads.length} waitlist threads`);
}

function parseWaitlistSignup(message) {
  const body = message.getPlainBody();
  const date = message.getDate();
  
  const email = extractField(body, /Email Address:\s*([^\s]+@[^\s]+)/i) || 
               extractField(body, /user_email[:\s]+([^\s]+@[^\s]+)/i) ||
               'N/A';
  
  const privacy = extractField(body, /Privacy Policy:\s*([^\n]+)/i) || 'Yes';
  const marketing = extractField(body, /Marketing Communications:\s*([^\n]+)/i) || 'Yes';
  const deviceInfo = extractField(body, /User Agent:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i) || 'N/A';
  const screenSize = extractField(body, /Screen Size:\s*([^\n]+)/i) || 'N/A';
  
  return [
    date,
    email,
    privacy,
    marketing,
    deviceInfo,
    screenSize,
    'Pending', // Status inicial
    '' // Notas vazias
  ];
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    console.log(`📄 Created new sheet: ${sheetName}`);
  }
  
  return sheet;
}

function extractField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function isDuplicate(sheet, email) {
  const data = sheet.getDataRange().getValues();
  return data.some(row => row[1] === email);
}

// ============================================
// FUNÇÃO DE SETUP (Executar uma vez)
// ============================================

function setupTrigger() {
  // Deletar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Criar novo trigger (executa a cada 5 minutos)
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  console.log('✅ Trigger configured to run every 5 minutes');
}

// ============================================
// FUNÇÃO DE TESTE
// ============================================

function testScript() {
  console.log('🧪 Testing script...');
  console.log('Spreadsheet ID:', CONFIG.SPREADSHEET_ID);
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    console.log('✅ Spreadsheet found:', ss.getName());
    
    processEmails();
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 
 * 1. CRIAR PLANILHA:
 *    - Abra Google Sheets
 *    - Crie nova planilha: "Dungeon Scoundrel - Data"
 *    - Copie o ID da URL (entre /d/ e /edit)
 *    - Cole no CONFIG.SPREADSHEET_ID acima
 * 
 * 2. CONFIGURAR SCRIPT:
 *    - Na planilha, vá em Extensions > Apps Script
 *    - Cole este código
 *    - Salve (Ctrl+S)
 * 
 * 3. EXECUTAR SETUP:
 *    - Selecione função: setupTrigger
 *    - Clique em Run (▶️)
 *    - Autorize as permissões
 * 
 * 4. TESTAR:
 *    - Selecione função: testScript
 *    - Clique em Run (▶️)
 *    - Verifique os logs
 * 
 * 5. PRONTO!
 *    - O script executará automaticamente a cada 5 minutos
 *    - Emails serão processados e adicionados às planilhas
 *    - Você pode ajustar o intervalo em setupTrigger()
 */
