# Guia passo a passo: Deploy do NC Messenger no Railway

Este guia explica em detalhes como enviar suas alterações para o repositório, fazer o deploy no Railway e configurar as variáveis VAPID.

## Build no Railway (Dockerfile)

O projeto inclui um **Dockerfile** para o Railway. O Railway usa-o automaticamente e compila o **better-sqlite3** no ambiente Linux, evitando erros como `npm error path /app`, `SIGTERM` ou "invalid ELF header". Basta fazer push do código (incluindo `Dockerfile` e `.dockerignore`); não é preciso ativar nada no painel.

---

## Parte 1: Enviar as alterações para o repositório (Git)

O Railway faz o deploy a partir do código que está no seu repositório (GitHub, GitLab, etc.). Por isso, primeiro você precisa **salvar** as alterações no repositório.

### 1.1 Abrir o terminal na pasta do projeto

1. Abra o **Cursor** (ou VS Code).
2. Abra a pasta do projeto: `C:\xampp\htdocs\NcApk`
3. Abra o terminal integrado:
   - **Atalho:** `` Ctrl+` `` (Ctrl + crase)
   - Ou menu: **Terminal** → **Novo Terminal**
4. Confirme que o caminho no terminal é algo como:  
   `C:\xampp\htdocs\NcApk` ou `...\NcApk`

### 1.2 Verificar se o Git está inicializado

No terminal, digite:

```bash
git status
```

- Se aparecer algo como **"not a git repository"**: o projeto ainda não é um repositório Git. Vá para o **Passo 1.3**.
- Se aparecer uma lista de arquivos modificados ou "On branch main" (ou master): o Git já está configurado. Vá para o **Passo 1.4**.

### 1.3 Inicializar o repositório Git (só se precisar)

Se o projeto ainda **não** for um repositório Git:

```bash
git init
```

Depois você precisará criar um repositório no GitHub/GitLab, conectar e dar o primeiro push. Se já tiver um repositório remoto configurado, pule para o **Passo 1.4**.

### 1.4 Adicionar os arquivos ao “stage” (preparar o commit)

No terminal, na pasta `NcApk`:

```bash
git add .
```

Isso prepara **todas** as alterações (incluindo `src/server/index.ts`, `railway.toml`, etc.) para o próximo commit.

- Para adicionar só alguns arquivos:  
  `git add src/server/index.ts railway.toml`

### 1.5 Fazer o commit (registrar as alterações)

```bash
git commit -m "Ajustes para Railway: 0.0.0.0, handlers de erro e railway.toml"
```

- A mensagem entre aspas pode ser outra, desde que descreva o que você alterou.
- Se aparecer **"nothing to commit"**: não há alterações novas; pode ser que já tenha feito commit antes. Nesse caso, pule para o **Passo 1.6** se já tiver repositório remoto.

### 1.6 Conectar ao repositório remoto (só na primeira vez)

Se ainda **não** conectou este projeto a um repositório no GitHub/GitLab:

1. Crie um repositório novo no **GitHub** (ou GitLab):
   - GitHub: https://github.com/new  
   - Nome sugerido: `nc-messenger` (ou outro).
   - **Não** marque “Add a README” se o projeto já tiver arquivos.
2. Copie a URL do repositório (ex.: `https://github.com/SEU_USUARIO/nc-messenger.git`).
3. No terminal:

```bash
git remote add origin https://github.com/SEU_USUARIO/nc-messenger.git
```

Substitua `SEU_USUARIO/nc-messenger` pela sua URL real.

### 1.7 Enviar as alterações (push)

```bash
git push -u origin main
```

- Se a branch principal no seu repositório for **master** em vez de **main**, use:  
  `git push -u origin master`
- Na primeira vez pode pedir login (GitHub/GitLab). Siga as instruções na tela.

Depois disso, as alterações estarão no repositório e o Railway (se estiver conectado a esse repositório) poderá usá-las no deploy.

---

## Parte 2: Fazer um novo deploy no Railway

O Railway pode estar configurado para deploy **automático** (a cada push) ou **manual**.

### 2.1 Deploy automático (recomendado)

1. No **Railway**, acesse o projeto: https://railway.com/dashboard  
2. Entre no projeto onde está o serviço **“servidor nc-messenger”**.
3. Se o serviço estiver conectado ao **mesmo repositório e branch** em que você deu push:
   - O Railway detecta o novo commit e **inicia um novo deploy sozinho**.
4. Clique no serviço **“servidor nc-messenger”**.
5. Abra a aba **“Deployments”** (ou “Implantações”).
6. O deploy mais recente deve aparecer como **“Building”** e depois **“Success”** ou **“Active”**.
7. Aguarde alguns minutos. Quando o status ficar verde/sucesso, o servidor estará no ar.

Nada mais é necessário neste caso.

### 2.2 Deploy manual (se não for automático)

1. No Railway, abra o projeto e o serviço **“servidor nc-messenger”**.
2. Procure o botão **“Deploy”** ou **“Redeploy”** / **“New deployment”**.
3. Clique para iniciar um novo deploy a partir do último commit do repositório conectado.
4. Acompanhe em **“Deployments”** até o status indicar sucesso.

### 2.3 Ver os logs após o deploy

1. No serviço **“servidor nc-messenger”**, abra a aba **“Logs”** (ou “Registros”).
2. Você deve ver mensagens como:
   - Banco de dados NC inicializado em ...
   - SMTP configurado!
   - Servidor NC em http://0.0.0.0:XXXX
3. Se o serviço cair de novo, procure no log por **uncaughtException** ou **unhandledRejection** para ver o erro exato.

---

## Parte 3: Configurar VAPID no Railway (opcional)

As chaves VAPID são usadas para **notificações push** no navegador. Configurá-las remove o aviso **“VAPID não configurado”** e deixa as notificações estáveis em produção.

### 3.1 Abrir as variáveis do serviço

1. Acesse o **Railway** e abra o projeto.
2. Clique no serviço **“servidor nc-messenger”** (não no projeto, e sim no serviço/retângulo do app).
3. Abra a aba **“Variables”** (Variáveis).  
   - Às vezes o nome é **“Variables”** ou **“Env”** / **“Environment”**.

### 3.2 Adicionar a variável NC_VAPID_PUBLIC

1. Clique em **“New Variable”** (ou “Add Variable” / “+”).
2. No campo **nome** (Name/Key), digite exatamente:  
   `NC_VAPID_PUBLIC`
3. No campo **valor** (Value), cole a chave pública (uma linha só, sem espaços no início/fim):  
   `BDTcUX09UKTqqmWD1VkGfqMyP0TBGXu4CBVaydD2rRXfQGY2hyuozhESFezEwEeGtkpnezeemImORNVVKBJr_Y0`
4. Salve (botão **Add** / **Save** / **Confirmar**).

### 3.3 Adicionar a variável NC_VAPID_PRIVATE

1. Clique de novo em **“New Variable”**.
2. Nome:  
   `NC_VAPID_PRIVATE`
3. Valor (chave privada, **não compartilhe em público**):  
   `PjSCJPQVs0ipFmQ4ZdhSWr0a0lDuTGFi3pZLjWayJUQ`
4. Salve.

### 3.4 Efeito das variáveis

- O Railway aplica as variáveis no próximo deploy (ou ao reiniciar o serviço).
- Se o deploy for automático, um novo push pode disparar um novo deploy e já usar as chaves.
- Depois do deploy, o aviso **“VAPID não configurado”** deve sumir dos logs.

---

## Resumo rápido

| Passo | O quê | Onde |
|-------|--------|------|
| 1 | `git add .` e `git commit -m "..."` | Terminal na pasta NcApk |
| 2 | `git push -u origin main` (ou master) | Terminal |
| 3 | Aguardar ou disparar deploy | Railway → Deployments |
| 4 | Ver logs em caso de erro | Railway → Logs |
| 5 | (Opcional) NC_VAPID_PUBLIC e NC_VAPID_PRIVATE | Railway → serviço → Variables |

Se algo falhar em algum passo (por exemplo, erro no `git push` ou deploy sempre falhando), anote a mensagem de erro e o passo em que parou para poder corrigir com precisão.
