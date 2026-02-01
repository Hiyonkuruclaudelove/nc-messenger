# 📱 GUIA RÁPIDO: CRIAR APP MÓVEL NC

## 🎯 RESUMO EXECUTIVO

**O QUE VOCÊ TEM AGORA:**
- ✅ Servidor funcionando (Backend completo)
- ✅ Cliente web funcionando

**O QUE VOCÊ VAI FAZER:**
- 🔄 Manter o servidor IGUAL (nada muda!)
- 📱 Criar app móvel React Native (substitui o cliente web)

---

## 📋 INÍCIO RÁPIDO (30 minutos)

### **PASSO 1: Instalar ferramentas** (5 min)

```bash
# Instalar Node.js (se ainda não tiver)
# Download: https://nodejs.org

# Instalar Expo CLI
npm install -g expo-cli

# Verificar
expo --version
```

---

### **PASSO 2: Criar projeto React Native** (5 min)

```bash
# Criar novo projeto
npx create-expo-app nc-mobile
cd nc-mobile

# Instalar dependências
npm install axios
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

---

### **PASSO 3: Estrutura de pastas** (2 min)

```bash
nc-mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   └── ChatScreen.js
│   ├── services/
│   │   ├── api.js
│   │   ├── websocket.js
│   │   └── e2e.js
│   └── components/
├── App.js
└── package.json
```

Crie as pastas:
```bash
mkdir -p src/screens src/services src/components
```

---

### **PASSO 4: Configurar API** (10 min)

Crie: **`src/services/api.js`**

```javascript
import axios from 'axios';

// IMPORTANTE: Trocar pelo endereço do SEU servidor!
const API_BASE = 'http://192.168.1.100:3000/api'; // IP do seu PC na rede local
// Ou use: 'https://seu-servidor.com/api' se já hospedou

let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

// Autenticação
export async function registerEmail(email) {
  const { data } = await axios.post(`${API_BASE}/auth/register/email`, { email });
  return data;
}

export async function registerVerify(email, code, name) {
  const { data } = await axios.post(`${API_BASE}/auth/register/verify`, {
    email, code, name
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

export async function loginSendCode(email) {
  const { data } = await axios.post(`${API_BASE}/auth/login/send-code`, { email });
  return data;
}

export async function loginEmail(email, code) {
  const { data } = await axios.post(`${API_BASE}/auth/login/email`, { email, code });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

// Usuários
export async function getMe() {
  const { data } = await axios.get(`${API_BASE}/users/me`, {
    headers: getHeaders()
  });
  return data;
}

// Mensagens
export async function getConversation(userId, limit = 50) {
  const { data } = await axios.get(
    `${API_BASE}/messages/conversation/${userId}?limit=${limit}`,
    { headers: getHeaders() }
  );
  return data;
}

export const API_WS_URL = API_BASE.replace('/api', '').replace('http', 'ws') + '/ws';
```

---

### **PASSO 5: Copiar E2E** (5 min)

Crie: **`src/services/e2e.js`**

```javascript
// COPIAR TODO O CONTEÚDO de: c:\xampp\htdocs\NcApk\public\e2e.js
// E colar aqui!

// O código é 100% compatível com React Native
// Apenas remova a linha: const NC_E2E = (function () {
// E adicione no final: export default NC_E2E;
```

---

### **PASSO 6: Criar tela de Login** (10 min)

Crie: **`src/screens/LoginScreen.js`**

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { registerEmail, registerVerify } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('email'); // email | code | name

  const handleEmailSubmit = async () => {
    try {
      await registerEmail(email);
      Alert.alert('Sucesso', 'Código enviado para seu email!');
      setStep('code');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao enviar código');
    }
  };

  const handleCodeSubmit = async () => {
    setStep('name');
  };

  const handleNameSubmit = async () => {
    try {
      const data = await registerVerify(email, code, name);
      navigation.replace('Home', { user: data.user });
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha no registro');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NC</Text>
      <Text style={styles.subtitle}>Mensagens com E2E</Text>

      {step === 'email' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleEmailSubmit}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'code' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Código (6 dígitos)"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleCodeSubmit}>
            <Text style={styles.buttonText}>Verificar</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'name' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.button} onPress={handleNameSubmit}>
            <Text style={styles.buttonText}>Criar Conta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0aec0',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e2442',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2d3558',
  },
  button: {
    width: '100%',
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

### **PASSO 7: Criar App.js** (3 min)

Edite: **`App.js`**

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

### **PASSO 8: Rodar o app!** (5 min)

```bash
# No terminal do projeto nc-mobile
npm start

# Vai abrir uma página web com QR code

# No celular:
# 1. Instale o app "Expo Go" (Google Play / App Store)
# 2. Escaneie o QR code
# 3. O app abre no celular!
```

---

## 🎯 PRÓXIMOS PASSOS

Agora você tem um app básico funcionando! Para completar:

### **1. Criar HomeScreen** (lista de conversas)
### **2. Criar ChatScreen** (tela de mensagens)
### **3. Implementar WebSocket** (mensagens em tempo real)
### **4. Adicionar notificações push**

---

## 📚 RECURSOS ÚTEIS

### Documentação:
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/

### Tutoriais:
- Como criar chat com WebSocket
- Como implementar E2E encryption
- Como publicar app na Google Play

### Comunidade:
- Stack Overflow
- Reddit: r/reactnative
- Discord: Reactiflux

---

## ⚙️ CONFIGURAÇÃO DO SERVIDOR PARA APP MÓVEL

### **Permitir acesso do app ao servidor:**

Edite: **`src/server/index.ts`**

```typescript
import cors from 'cors';

const app = express();

// Permitir requests de qualquer origem (desenvolvimento)
app.use(cors({
  origin: '*', // Em produção, especifique o domínio do app
  credentials: true
}));
```

### **Descobrir IP do seu PC:**

```bash
# Windows
ipconfig
# Procure por "IPv4 Address" da sua rede WiFi
# Exemplo: 192.168.1.100

# Use esse IP no app:
# API_BASE = 'http://192.168.1.100:3000/api'
```

### **Servidor deve estar rodando:**
```bash
cd c:\xampp\htdocs\NcApk
npm run dev
# Servidor em: http://192.168.1.100:3000
```

---

## ✅ CHECKLIST DESENVOLVIMENTO

- [ ] Node.js instalado
- [ ] Expo CLI instalado
- [ ] Projeto nc-mobile criado
- [ ] Dependências instaladas
- [ ] Estrutura de pastas criada
- [ ] api.js configurado com IP correto
- [ ] e2e.js copiado
- [ ] LoginScreen criado
- [ ] App.js configurado
- [ ] Servidor NC rodando
- [ ] CORS configurado no servidor
- [ ] App testado no celular (Expo Go)

---

## 🚀 RESULTADO

Após seguir este guia, você terá:

✅ **Servidor NC** rodando no PC  
✅ **App móvel** básico funcionando no celular  
✅ **Conexão** funcionando entre app e servidor  
✅ **Login** funcionando  

**Próximo:** Implementar HomeScreen e ChatScreen! 📱💬
