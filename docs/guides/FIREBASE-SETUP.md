# 🔥 Configuração do Firebase - Passo a Passo

## 📋 Resumo
Este guia mostra como configurar o Firebase para o Leaderboard funcionar.

---

## 🚀 Passo a Passo

### **1. Criar Projeto no Firebase**

1. Acesse: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Clique em **"Adicionar projeto"**
4. Nome: `dungeon-scoundrel` (ou outro de sua preferência)
5. Google Analytics: Pode desabilitar
6. Clique em **"Criar projeto"**

---

### **2. Ativar Firestore Database**

1. Menu lateral → **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. **Modo**: Selecione **"Modo de teste"**
4. **Local**: Escolha o mais próximo (ex: `southamerica-east1`)
5. Clique em **"Ativar"**

---

### **3. Ativar Authentication (Anônimo)**

1. Menu lateral → **"Authentication"**
2. Clique em **"Começar"**
3. Aba **"Sign-in method"**
4. Clique em **"Anônimo"** (Anonymous)
5. **Ativar** o método
6. Salvar

---

### **4. Obter Credenciais do App**

1. Clique no **ícone de engrenagem** ⚙️
2. **"Configurações do projeto"**
3. Role até **"Seus apps"**
4. Clique no ícone **</>** (Web)
5. Apelido: `dungeon-scoundrel-web`
6. **Registrar app**

Você verá algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

**COPIE ESSES DADOS!**

---

### **5. Configurar no Projeto**

1. Abra o arquivo: `firebase-config.js`
2. **SUBSTITUA** os valores de exemplo pelos SEUS valores:

```javascript
window.__firebase_config = JSON.stringify({
    apiKey: "COLE_SUA_API_KEY_AQUI",
    authDomain: "COLE_SEU_AUTH_DOMAIN_AQUI",
    projectId: "COLE_SEU_PROJECT_ID_AQUI",
    storageBucket: "COLE_SEU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "COLE_SEU_MESSAGING_SENDER_ID_AQUI",
    appId: "COLE_SEU_APP_ID_AQUI"
});
```

3. **Salve** o arquivo
4. Abra `index.html` no navegador
5. Teste o leaderboard!

---

## ✅ Checklist de Verificação

- [ ] Projeto criado no Firebase Console
- [ ] Firestore Database ativado (modo teste)
- [ ] Authentication Anônimo ativado
- [ ] App Web registrado
- [ ] Credenciais copiadas
- [ ] Arquivo `firebase-config.js` atualizado com suas credenciais
- [ ] Arquivo salvo
- [ ] Jogo aberto no navegador

---

## 🔒 Segurança - Modo de Produção

Depois dos testes, atualize as regras do Firestore:

1. Firebase Console → **Firestore Database** → **Regras**
2. Cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/leaderboard_{difficulty}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. **Publicar** as regras

---

## 🐛 Solução de Problemas

### **"Could not connect to Leaderboard"**
- Verifique se colocou as credenciais corretas
- Confirme que o Firestore está ativado
- Abra o Console do navegador (F12) e veja os erros

### **"Submission failed"**
- Verifique se Authentication está ativo
- Confirme que as regras do Firestore permitem escrita
- Veja o Console do navegador para detalhes

### **Modo Offline funciona?**
- Sim! Achievements e unlocks são salvos localmente
- Apenas o leaderboard online requer Firebase

---

## 📊 Estrutura do Firestore

Após configurar, os dados serão salvos assim:

```
/artifacts/
  └── {appId}/
      └── public/
          └── data/
              ├── leaderboard_easy/
              ├── leaderboard_normal/
              ├── leaderboard_hard/
              └── leaderboard_endless/
```

---

## 🎮 Pronto!

Depois de configurar, o leaderboard funcionará automaticamente!

Rankings separados por dificuldade:
- 🟢 Easy
- 🟡 Normal
- 🔴 Hard
- ♾️ Endless

Cada jogador competirá apenas com outros da mesma dificuldade!
