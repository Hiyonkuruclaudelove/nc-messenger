# NC - Aplicativo de Mensagens Instantâneas

Aplicativo de mensagens instantâneas com arquitetura **cliente-servidor**, incluindo **XMPP**, **MMS**, **Push Notification** e **criptografia ponta a ponta**.

## Componentes do servidor

1. **XMPP (Extensible Messaging and Presence Protocol)**  
   WebSocket em `/ws` para conexão dos clientes e envio/recebimento de mensagens em tempo real.

2. **MMS (Multimedia Messaging Service)**  
   Upload e entrega de arquivos multimídia (fotos, vídeos, áudio) em `/api/mms`.

3. **Push Notification Service**  
   Envio de notificações quando o usuário recebe mensagens (Web Push).

4. **Banco de dados**  
   SQLite em `data/nc.db`: usuários (email, nome, foto de perfil), mensagens (criptografadas E2E), sessões e assinaturas push.

## Funcionamento

### Registro

1. Usuário envia o **email** para o servidor.
2. O servidor verifica se o email é válido e se ainda não está cadastrado.
3. O servidor envia um **código de verificação** de 6 dígitos para o email.
4. O usuário informa o código e o **nome** (no primeiro cadastro).
5. O servidor valida o código e **cria a conta**, retornando um token de sessão.

### Login

1. Usuário informa o **email**.
2. Servidor envia **código** para o email (rota `/api/auth/login/send-code`).
3. Usuário informa o **código**; servidor valida e retorna **token**.

### Envio de mensagens

1. Cliente envia a mensagem (já **criptografada** no dispositivo) para o servidor via WebSocket (XMPP).
2. Servidor verifica se o **destinatário** é um usuário válido.
3. Servidor **armazena** a mensagem cifrada no banco.
4. Servidor **notifica** o destinatário (Push e/ou WebSocket).
5. Servidor **entrega** a mensagem ao destinatário (WebSocket); apenas o cliente do destinatário descriptografa.

### Segurança (E2E)

As mensagens são **criptografadas no dispositivo do remetente** (AES-GCM no cliente web) e **descriptografadas no dispositivo do destinatário**. O servidor só armazena e repassa o texto cifrado.

## Como rodar

### Pré-requisitos

- Node.js 18+
- (Opcional) Servidor SMTP para envio de emails (ex.: MailHog na porta 1025 para desenvolvimento)

### Instalação

```bash
npm install
```

### Banco de dados

O banco é criado automaticamente na primeira execução. Para recriar as tabelas:

```bash
npm run db:init
```

### Servidor

```bash
npm run dev
```

Servidor em **http://localhost:3000**:

- **API**: `/api/auth`, `/api/users`, `/api/messages`, `/api/push`, `/api/mms`
- **WebSocket (XMPP)**: `ws://localhost:3000/ws`
- **Cliente web**: raiz `/`
- **Uploads (MMS)**: `/uploads`

### Variáveis de ambiente (opcional)

| Variável           | Descrição                          |
|--------------------|------------------------------------|
| `PORT`             | Porta HTTP (padrão: 3000)          |
| `NC_SMTP_HOST`     | Host SMTP para códigos de email    |
| `NC_SMTP_PORT`     | Porta SMTP (ex.: 1025)             |
| `NC_SMTP_USER`     | Usuário SMTP                       |
| `NC_SMTP_PASS`     | Senha SMTP                         |
| `NC_EMAIL_FROM`    | Endereço "De" dos emails           |
| `NC_VAPID_PUBLIC`  | Chave pública VAPID (Push)         |
| `NC_VAPID_PRIVATE` | Chave privada VAPID (Push)         |

Sem SMTP configurado, o envio de email pode falhar (em desenvolvimento use MailHog ou similar).

## Estrutura do projeto

```
NcApk/
├── data/           # SQLite (nc.db) e uploads (MMS)
├── public/         # Cliente web (HTML, CSS, JS, E2E)
├── src/
│   ├── db/         # Schema, usuários, mensagens, sessões, push
│   ├── middleware/# Autenticação (token)
│   ├── routes/     # auth, users, messages, push, mms
│   ├── services/   # email, push, mms, xmpp (WebSocket)
│   └── server/     # Express + WebSocket
├── package.json
├── tsconfig.json
└── README.md
```

## Licença

MIT.
