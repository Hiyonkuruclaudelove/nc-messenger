# Guia detalhado: Configurar email (domínio) e colocar o NC em produção

Este guia explica **passo a passo** como configurar o envio de códigos de verificação para o email que o utilizador introduz, usando o **email do seu domínio** (nc@claudeservices.com no Hostinger), e como fazer o deploy do projeto.

---

## Parte 1: Obter a senha do email do domínio (Hostinger)

O NC vai usar o email **nc@claudeservices.com** para **enviar** os códigos. Precisa da **senha desse email**.

### 1.1 Entrar no painel Hostinger

1. Abra o browser e vá a **https://www.hostinger.pt** (ou .com).
2. Clique em **Iniciar sessão** e entre com a sua conta.
3. No painel, vá a **Emails** (ou **Contas de email** / **Email Accounts**).

### 1.2 Ver ou definir a senha do nc@claudeservices.com

1. Na lista de contas de email, procure **nc@claudeservices.com**.
2. Se a conta ainda não existir:
   - Clique em **Criar conta de email**.
   - Nome de utilizador: **nc** (o domínio já está selecionado).
   - Defina uma **senha forte** e guarde-a num sítio seguro.
   - Crie a conta.
3. Se a conta já existir e não souber a senha:
   - Clique nos **três pontos** ou em **Gerir** ao lado de nc@claudeservices.com.
   - Escolha **Alterar senha**.
   - Defina uma nova senha e **copie-a** (vai precisar para o `.env`).

**Anote:**  
- Email: `nc@claudeservices.com`  
- Senha: `xxxxxxxx` (a que definiu ou alterou)

---

## Parte 2: Onde está o servidor NC?

O NC pode estar em vários sítios. Escolha o que se aplica.

| Onde está o NC? | Onde configurar o .env |
|-----------------|------------------------|
| **Railway**     | Variáveis de ambiente no painel Railway |
| **VPS / servidor com SSH** | Ficheiro `.env` na pasta do projeto no servidor |
| **PC em casa (XAMPP)** | Ficheiro `.env` na pasta `C:\xampp\htdocs\NcApk` |
| **Hostinger (Node)** | Painel Hostinger ou ficheiro no projeto |

---

## Parte 3: Configurar o .env (detalhado)

### Opção A: Servidor na Railway

1. Abra **https://railway.app** e inicie sessão.
2. Abra o **projeto** onde está o NC Messenger.
3. Clique no **serviço** (app) do NC.
4. Vá ao separador **Variables** (Variáveis).
5. Clique em **+ New Variable** (ou **Add Variable**) e adicione **uma a uma**:

   | Nome da variável | Valor |
   |------------------|--------|
   | `NC_SMTP_HOST` | `smtp.hostinger.com` |
   | `NC_SMTP_PORT` | `587` |
   | `NC_SMTP_USER` | `nc@claudeservices.com` |
   | `NC_SMTP_PASS` | *(a senha que anotou na Parte 1)* |
   | `NC_EMAIL_FROM` | `Claude Services <nc@claudeservices.com>` |

6. Guarde. O Railway costuma **reiniciar o serviço** sozinho ao alterar variáveis.
7. Se não reiniciar: separador **Deployments** → menu do último deploy → **Redeploy**.

### Opção B: VPS ou servidor com SSH (Linux)

1. Ligue-se ao servidor por SSH, por exemplo:
   ```bash
   ssh utilizador@ip-do-servidor
   ```
2. Vá à pasta do projeto NC, por exemplo:
   ```bash
   cd /var/www/NcApk
   ```
   (ajuste o caminho ao que usa no seu servidor.)
3. Crie ou edite o ficheiro `.env`:
   ```bash
   nano .env
   ```
4. Cole ou edite para ficar assim (troque `SUA_SENHA_REAL` pela senha do nc@claudeservices.com):

   ```env
   PORT=3000
   NC_SMTP_HOST=smtp.hostinger.com
   NC_SMTP_PORT=587
   NC_SMTP_USER=nc@claudeservices.com
   NC_SMTP_PASS=SUA_SENHA_REAL
   NC_EMAIL_FROM=Claude Services <nc@claudeservices.com>
   ```

5. Gravar no nano: **Ctrl+O**, Enter. Sair: **Ctrl+X**.
6. Reiniciar o servidor NC. Se usar **pm2**, por exemplo:
   ```bash
   pm2 restart nc
   ```
   Ou pare o processo e volte a iniciar com `npm start` ou o comando que usa.

### Opção C: No seu PC (XAMPP / desenvolvimento)

1. Abra a pasta do projeto no Explorador de Ficheiros:
   ```
   C:\xampp\htdocs\NcApk
   ```
2. Se não existir um ficheiro chamado **`.env`**, copie o **`.env.example`** e renomeie a cópia para **`.env`**.
3. Abra o **`.env`** com o Bloco de notas ou com o Cursor/VS Code.
4. Deixe ou escreva exatamente (substitua a senha):

   ```env
   PORT=3000
   NC_SMTP_HOST=smtp.hostinger.com
   NC_SMTP_PORT=587
   NC_SMTP_USER=nc@claudeservices.com
   NC_SMTP_PASS=senha_que_anotou_na_parte_1
   NC_EMAIL_FROM=Claude Services <nc@claudeservices.com>
   ```

5. Guarde o ficheiro.
6. Feche o terminal onde o NC está a correr (Ctrl+C) e execute de novo **`iniciar.bat`** (ou `npm run dev`).

---

## Parte 4: Fazer deploy do projeto atualizado

Para o servidor (e o app no telemóvel) usarem o código que envia o código para o email introduzido, o projeto tem de estar atualizado no sítio onde o NC corre.

### 4.1 Se usar Railway e Git (GitHub/GitLab)

1. No seu PC, na pasta do projeto (`C:\xampp\htdocs\NcApk`), abra o terminal (PowerShell ou CMD).
2. Verifique se há alterações por enviar:
   ```bash
   git status
   ```
3. Adicione e envie as alterações:
   ```bash
   git add .
   git commit -m "Configurar envio de código para o email introduzido"
   git push origin main
   ```
   (Troque `main` por `master` se for o nome da sua branch.)
4. No Railway, o deploy costuma começar sozinho após o `git push`. Veja o separador **Deployments** para confirmar.

### 4.2 Se usar um VPS e copiar ficheiros

1. No seu PC, comprima a pasta do projeto (sem `node_modules` e sem `android`, se quiser) ou use **rsync**/SCP.
2. No servidor, pare o NC, substitua os ficheiros do projeto e volte a iniciar o NC (por exemplo com `pm2 restart nc` ou `npm start`).
3. Confirme que o ficheiro **`.env`** no servidor tem as variáveis da Parte 3 (Opção B).

### 4.3 Se o NC corre só no PC (XAMPP)

Não é preciso “deploy”: basta ter o `.env` configurado (Parte 3, Opção C) e reiniciar com **`iniciar.bat`**. O app no telemóvel só receberá os emails corretos se estiver a usar este PC como servidor (ex.: mesmo Wi‑Fi e URL do tipo `http://IP_DO_PC:3000`).

---

## Parte 5: Confirmar que está a funcionar

1. No browser ou no app no telemóvel, abra o NC (URL do seu servidor ou do PC).
2. Na primeira ecrã, introduza um **email seu** (por exemplo outro Gmail ou o nc@claudeservices.com).
3. Clique em **Continuar**.
4. Verifique:
   - No **servidor** (logs no Railway, terminal do PC ou `pm2 logs`): deve aparecer uma linha do tipo “Enviando código para o email introduzido: seu@email.com”.
   - Na **caixa de entrada** (e Spam) desse email: deve chegar uma mensagem com o assunto “[NC] Código de verificação” e o código de 6 dígitos.
5. Introduza o código na app e complete o registo ou login.

Se o email não chegar, veja a Parte 6.

---

## Parte 6: Se o email não chegar

1. **Confirme o .env (ou variáveis no Railway):**
   - `NC_SMTP_HOST=smtp.hostinger.com`
   - `NC_SMTP_PORT=587`
   - `NC_SMTP_USER=nc@claudeservices.com`
   - `NC_SMTP_PASS` = senha **correta** do nc@claudeservices.com
   - `NC_EMAIL_FROM=Claude Services <nc@claudeservices.com>`

2. **Reinicie o servidor** depois de alterar o `.env` ou as variáveis.

3. **Veja os logs do servidor:**  
   No Railway: separador **Deployments** → último deploy → **View Logs**.  
   No PC: janela do terminal onde corre o NC.  
   Procure mensagens como “Falha ao enviar” ou “ERRO ao enviar email” para ver o motivo.

4. **Spam:** confira a pasta **Spam / Lixo eletrónico** do email onde pediu o código.

5. **Senha do Hostinger:** algumas contas exigem “senha de aplicação” ou permitem apenas certas aplicações. No painel do Hostinger, confirme as definições de segurança do email nc@claudeservices.com.

---

## Parte 7: App no telemóvel (APK)

- Se o **app no telemóvel** abre o NC a partir de uma **URL** (ex.: https://seu-nc.railway.app), basta que o **servidor** esteja atualizado e com o `.env` configurado. O app usa o mesmo `app.js` que o servidor entrega; não é obrigatório gerar novo APK.
- Se o app foi feito para abrir ficheiros **locais** (embalados no APK) e não fala com o seu servidor, aí sim precisa de **gerar um novo APK** (por exemplo com **Build → Build APK(s)** no Android Studio), copiar o novo APK para `public/apk/nc-messenger.apk` e voltar a instalar no telemóvel.

---

## Resumo rápido

| Passo | O que fazer |
|-------|-------------|
| 1 | Obter a senha do email **nc@claudeservices.com** no painel Hostinger (criar conta ou alterar senha). |
| 2 | No **servidor** onde o NC corre: criar/editar **`.env`** (ou variáveis no Railway) com `NC_SMTP_*` e `NC_EMAIL_FROM`. |
| 3 | **Reiniciar** o servidor NC. |
| 4 | Fazer **deploy** do projeto atualizado (git push para Railway ou copiar ficheiros para VPS). |
| 5 | Testar com um email seu e verificar receção do código e logs do servidor. |

Com isto, o código de verificação passa a ser enviado **para o email que o utilizador introduz**, usando as **configurações do domínio** (nc@claudeservices.com no Hostinger).
