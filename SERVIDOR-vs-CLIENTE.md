# 📱 NC - SERVIDOR vs CLIENTE (APP MÓVEL)

## 🎯 SEPARAÇÃO DO PROJETO

O projeto NC está dividido em **2 partes principais**:

---

## 🖥️ PARTE 1: SERVIDOR (Backend)

### 📂 O QUE É O SERVIDOR?
O servidor é o **cérebro** do NC. Ele fica rodando 24/7 e gerencia:
- ✅ Autenticação de usuários
- ✅ Armazenamento de mensagens
- ✅ Roteamento de mensagens entre usuários
- ✅ Banco de dados
- ✅ Envio de emails
- ✅ Push notifications
- ✅ Upload de arquivos (MMS)
- ✅ WebSocket (XMPP) para mensagens em tempo real

### 📁 ARQUIVOS DO SERVIDOR:
```
NcApk/
├── src/                    ← SERVIDOR (Backend)
│   ├── db/                # Banco de dados
│   │   ├── init.ts
│   │   ├── users.ts
│   │   ├── messages.ts
│   │   ├── sessions.ts
│   │   └── ...
│   ├── services/          # Serviços do servidor
│   │   ├── xmpp.ts       # WebSocket
│   │   ├── email.ts      # Envio de emails
│   │   ├── push.ts       # Push notifications
│   │   └── mms.ts        # Upload de arquivos
│   ├── routes/            # API REST
│   │   ├── auth.ts       # /api/auth/*
│   │   ├── users.ts      # /api/users/*
│   │   ├── messages.ts   # /api/messages/*
│   │   ├── push.ts       # /api/push/*
│   │   └── mms.ts        # /api/mms/*
│   ├── middleware/        # Middleware
│   │   └── auth.ts       # Autenticação
│   └── server/
│       └── index.ts      # Servidor principal
├── data/                  ← DADOS DO SERVIDOR
│   ├── nc.db             # Banco de dados SQLite
│   └── uploads/          # Arquivos enviados (MMS)
├── package.json          ← Dependências do servidor
├── tsconfig.json
├── .env                  ← Configurações do servidor
└── reiniciar.bat         ← Script para iniciar servidor
```

### 🌐 API REST DO SERVIDOR:
O servidor expõe estas rotas HTTP:

**Autenticação:**
- `POST /api/auth/register/email` - Enviar código para email
- `POST /api/auth/register/verify` - Verificar código e criar conta
- `POST /api/auth/login/send-code` - Enviar código de login
- `POST /api/auth/login/email` - Login com código

**Usuários:**
- `GET /api/users/me` - Dados do usuário autenticado
- `GET /api/users/:id` - Dados de outro usuário
- `PATCH /api/users/me/name` - Atualizar nome
- `PATCH /api/users/me/public-key` - Atualizar chave pública (E2E)

**Mensagens:**
- `GET /api/messages/conversation/:otherId` - Histórico de conversa
- `GET /api/messages/inbox` - Mensagens recebidas

**Push:**
- `POST /api/push/subscribe` - Registrar para push notifications

**MMS:**
- `POST /api/mms/upload` - Upload de arquivo
- `POST /api/mms/profile-photo` - Upload de foto de perfil
- `GET /uploads/:filename` - Download de arquivo

**WebSocket:**
- `WS /ws` - Conexão WebSocket (XMPP) para mensagens em tempo real

### 💻 TECNOLOGIAS DO SERVIDOR:
- **Node.js** + TypeScript
- **Express** (API REST)
- **WebSocket (ws)** (Mensagens em tempo real)
- **SQLite** (Banco de dados)
- **Nodemailer** (Emails)
- **Web-Push** (Notificações)
- **Multer** (Upload de arquivos)

### 🚀 COMO RODAR O SERVIDOR:
```bash
cd c:\xampp\htdocs\NcApk
npm install
npm run dev
```

O servidor fica rodando em: **http://localhost:3000**

---

## 📱 PARTE 2: CLIENTE (Frontend / App Móvel)

### 📂 O QUE É O CLIENTE?
O cliente é o **aplicativo** que os usuários usam. Pode ser:
- 🌐 **Web** (navegador)
- 📱 **Mobile** (Android/iOS)
- 🖥️ **Desktop** (Windows/Mac/Linux)

### 📁 ARQUIVOS DO CLIENTE (Atual - Web):
```
NcApk/
└── public/              ← CLIENTE (Frontend Web)
    ├── index.html      # Estrutura da interface
    ├── styles.css      # Estilos (visual)
    ├── app.js          # Lógica do aplicativo
    ├── e2e.js          # Criptografia ponta a ponta
    └── chat-bg.svg     # Recursos visuais
```

### 🔌 O QUE O CLIENTE FAZ:
- ✅ Interface visual (telas, botões, campos)
- ✅ Coleta dados do usuário (email, mensagens)
- ✅ Envia requisições HTTP para o servidor (API)
- ✅ Conecta via WebSocket para mensagens em tempo real
- ✅ Criptografa/descriptografa mensagens (E2E)
- ✅ Mostra notificações
- ✅ Exibe conversas e mensagens

### 📡 COMUNICAÇÃO CLIENTE ↔ SERVIDOR:
```
CLIENTE (App Móvel)  →  HTTP/WebSocket  →  SERVIDOR (Backend)
     📱                                          🖥️

Exemplos:
- Login: App envia email → Servidor valida → Retorna token
- Mensagem: App criptografa → WebSocket → Servidor → Destinatário
- Perfil: App pede dados → HTTP GET → Servidor retorna JSON
```

---

## 📱 CRIAR APLICATIVO MÓVEL (Android/iOS)

### 🎯 O QUE VOCÊ PRECISA FAZER:

1. **MANTER O SERVIDOR** (Backend)
   - ✅ Todo o código em `src/` continua igual
   - ✅ Servidor fica rodando em um **servidor real** (não localhost)
   - ✅ Exemplo: `https://seu-servidor.com`

2. **RECRIAR O CLIENTE** como App Móvel
   - ❌ Não usar `public/` (é para web)
   - ✅ Criar novo projeto móvel
   - ✅ Fazer as mesmas chamadas HTTP/WebSocket
   - ✅ Mesma lógica de E2E (`e2e.js`)

---

## 🛠️ TECNOLOGIAS RECOMENDADAS PARA APP MÓVEL

### Opção 1: **React Native** (Recomendado! 🌟)
**Vantagens:**
- ✅ **1 código** → Android + iOS
- ✅ JavaScript (similar ao `app.js` atual)
- ✅ Grande comunidade
- ✅ Performance nativa
- ✅ Usa as **mesmas APIs** do servidor

**Bibliotecas úteis:**
```javascript
// HTTP requests
import axios from 'axios';

// WebSocket
import WebSocket from 'react-native-websocket';

// Criptografia E2E
import CryptoJS from 'crypto-js';
// ou
import * as Crypto from 'expo-crypto';

// Push Notifications
import * as Notifications from 'expo-notifications';
```

**Estrutura do projeto React Native:**
```
nc-mobile/
├── src/
│   ├── screens/         # Telas
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   └── ChatScreen.js
│   ├── services/        # Comunicação com servidor
│   │   ├── api.js      # HTTP calls (axios)
│   │   ├── websocket.js # WebSocket (XMPP)
│   │   └── e2e.js      # Criptografia (mesmo do web!)
│   ├── components/      # Componentes reutilizáveis
│   └── utils/
├── package.json
└── app.json
```

**Exemplo de chamada API:**
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE = 'https://seu-servidor.com/api';

export async function login(email, code) {
  const response = await axios.post(`${API_BASE}/auth/login/email`, {
    email,
    code
  });
  return response.data;
}

export async function sendMessage(recipientId, bodyEncrypted, token) {
  // Via WebSocket, não HTTP
  ws.send(JSON.stringify({
    type: 'message',
    payload: { recipientId, bodyEncrypted }
  }));
}
```

---

### Opção 2: **Flutter** (Dart)
**Vantagens:**
- ✅ **1 código** → Android + iOS
- ✅ Performance excelente
- ✅ UI bonita e customizável
- ⚠️ Linguagem diferente (Dart, não JavaScript)

---

### Opção 3: **Nativo** (Java/Kotlin para Android, Swift para iOS)
**Vantagens:**
- ✅ Performance máxima
- ✅ Acesso total ao sistema
- ❌ **2 códigos** (um para Android, outro para iOS)
- ❌ Mais complexo

---

## 📋 PASSO A PASSO: TRANSFORMAR EM APP MÓVEL

### **1. Preparar o Servidor**

#### a) Hospedar o servidor em um servidor real:
```bash
# Opções de hospedagem:
- Heroku (grátis para teste)
- Railway (grátis para teste)
- DigitalOcean (pago, $5/mês)
- AWS / Azure / Google Cloud
- Servidor próprio (VPS)
```

#### b) Trocar `localhost` por URL real:
```env
# .env no servidor
PORT=3000
NC_SMTP_HOST=smtp.gmail.com
NC_SMTP_USER=seu@gmail.com
# ... etc
```

#### c) Configurar HTTPS (obrigatório para produção):
```bash
# Usar certificado SSL (Let's Encrypt gratuito)
# Servidor deve estar em https://seu-servidor.com
```

---

### **2. Criar App Móvel React Native**

#### a) Criar projeto:
```bash
npx create-expo-app nc-mobile
cd nc-mobile
npm install axios react-native-websocket
```

#### b) Estrutura básica:
```javascript
// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### c) Copiar lógica E2E:
```javascript
// src/services/e2e.js
// COPIAR TODO O CONTEÚDO de public/e2e.js
// Adaptar para usar React Native Crypto
```

#### d) Criar serviço de API:
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE = 'https://seu-servidor.com/api';
let token = null;

export function setToken(t) {
  token = t;
}

export async function registerEmail(email) {
  const { data } = await axios.post(`${API_BASE}/auth/register/email`, { email });
  return data;
}

export async function registerVerify(email, code, name) {
  const { data } = await axios.post(`${API_BASE}/auth/register/verify`, {
    email, code, name
  });
  setToken(data.token);
  return data;
}

// ... todas as outras chamadas
```

#### e) Conectar WebSocket:
```javascript
// src/services/websocket.js
import { NativeModules } from 'react-native';

const ws = new WebSocket('wss://seu-servidor.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    payload: { token }
  }));
};

ws.onmessage = (event) => {
  const frame = JSON.parse(event.data);
  // Processar mensagem recebida
};

export function sendMessage(recipientId, bodyEncrypted) {
  ws.send(JSON.stringify({
    type: 'message',
    payload: { recipientId, bodyEncrypted, type: 'text' }
  }));
}
```

---

### **3. Testar**

```bash
# Testar no emulador Android
npm run android

# Testar no emulador iOS (só no Mac)
npm run ios

# Testar no celular real (via Expo)
npm start
# Escanear QR code no celular
```

---

## 📊 RESUMO: ARQUITETURA FINAL

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  📱 APP MÓVEL (React Native)                        │
│  ├── Telas (Login, Home, Chat)                     │
│  ├── Lógica E2E (Criptografia)                     │
│  ├── HTTP Client (Axios)                           │
│  └── WebSocket Client                              │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTPS / WebSocket
                   │
┌──────────────────▼──────────────────────────────────┐
│                                                     │
│  🖥️ SERVIDOR (Node.js + TypeScript)                │
│  ├── API REST (/api/auth, /api/messages, etc)     │
│  ├── WebSocket (/ws - XMPP)                        │
│  ├── Banco de dados (SQLite)                       │
│  ├── Upload de arquivos (MMS)                      │
│  ├── Push Notifications                            │
│  └── Email (Nodemailer)                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST: MIGRAÇÃO PARA APP MÓVEL

### Servidor:
- [ ] Hospedar em servidor real (não localhost)
- [ ] Configurar HTTPS (certificado SSL)
- [ ] Configurar CORS para aceitar requests do app
- [ ] Testar todas as rotas da API
- [ ] Configurar push notifications (VAPID)

### App Móvel:
- [ ] Criar projeto React Native
- [ ] Criar telas (Login, Home, Chat)
- [ ] Implementar chamadas HTTP (API)
- [ ] Implementar WebSocket (XMPP)
- [ ] Portar criptografia E2E
- [ ] Implementar notificações push
- [ ] Testar em Android
- [ ] Testar em iOS
- [ ] Publicar na Google Play / App Store

---

## 🎯 CONCLUSÃO

**SERVIDOR (Backend):**
- Local: `src/` + `data/`
- Roda em: Servidor real (VPS, cloud, etc)
- Tecnologia: Node.js + TypeScript + Express + WebSocket
- **Você NÃO precisa mudar nada no servidor!**

**CLIENTE (Frontend/App):**
- Local atual: `public/` (web)
- Local novo: Projeto React Native separado
- Tecnologia: React Native + Axios + WebSocket
- **Você vai RECRIAR a interface no React Native**
- **A lógica E2E pode ser COPIADA e adaptada**

---

**O servidor continua igual! Só muda a forma de acessar (app móvel ao invés de web)!** 🚀
