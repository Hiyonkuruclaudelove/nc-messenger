# 🚀 Como iniciar o NC

## Passo 1: Instalar dependências

Abra o terminal (PowerShell ou CMD) nesta pasta e execute:

```bash
npm install
```

⏱️ Isso pode levar alguns minutos na primeira vez.

## Passo 2: Rodar o servidor

```bash
npm run dev
```

Você verá algo assim:

```
╔════════════════════════════════════════╗
║   CÓDIGO DE VERIFICAÇÃO (DEV MODE)     ║
╠════════════════════════════════════════╣
║   Email: seu@email.com                 ║
║   Código: 123456                       ║
╚════════════════════════════════════════╝

NC servidor em http://localhost:3000
```

## Passo 3: Abrir no navegador

Acesse: **http://localhost:3000**

## 📝 Como usar

### Primeira vez (Registro)

1. Digite seu email (pode ser qualquer um, ex: `teste@email.com`)
2. Clique em **"Continuar"**
3. **Veja o código no terminal** (janela onde rodou `npm run dev`)
4. Digite o código de 6 dígitos
5. Digite seu nome
6. Pronto! Você está dentro

### Login (próximas vezes)

1. Digite o mesmo email
2. Veja o código no terminal
3. Digite o código
4. Pronto!

### Conversar com alguém

1. Copie seu **ID** (aparece na tela: "Seu ID para outros te adicionarem: ...")
2. Compartilhe com outra pessoa
3. Peça o ID dela
4. Clique em **"Nova conversa"**
5. Cole o ID da outra pessoa
6. Envie mensagens! 🔐 (Criptografadas E2E)

## 🧪 Testar sozinho

Para simular 2 usuários:

1. Abra **2 abas anônimas** no navegador (Ctrl+Shift+N no Chrome)
2. **Aba 1**: Cadastre `usuario1@teste.com`
   - Copie o ID do usuário 1
3. **Aba 2**: Cadastre `usuario2@teste.com`
   - Clique em "Nova conversa"
   - Cole o ID do usuário 1
   - Envie uma mensagem!
4. **Aba 1**: A mensagem aparece em tempo real! ⚡

## ⚙️ Modo de desenvolvimento

- **Códigos de verificação**: Aparecem no terminal (DEV MODE)
- **Banco de dados**: SQLite em `data/nc.db`
- **Uploads**: Salvos em `data/uploads/`
- **Porta**: 3000 (padrão)

## ❓ Problemas comuns

**"npm: command not found"**
- Instale o Node.js: https://nodejs.org

**"Porta 3000 em uso"**
- Use outra porta: `set PORT=3001` e rode `npm run dev`

**"Mensagens não chegam"**
- Recarregue a página (F5)
- Verifique se o servidor está rodando

## 📧 Email real (opcional)

Se quiser enviar emails reais, crie um arquivo `.env`:

```
NC_SMTP_HOST=smtp.gmail.com
NC_SMTP_PORT=587
NC_SMTP_USER=seu@gmail.com
NC_SMTP_PASS=sua-senha-app
NC_EMAIL_FROM=NC <seu@gmail.com>
```

---

**Pronto para começar!** Execute `npm install` e depois `npm run dev` 🎉
