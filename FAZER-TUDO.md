# Fazer tudo: Deploy Railway + Painel Admin a funcionar

Este guia reúne os passos para: **corrigir o build no Railway**, **ter o servidor NC no ar** e **o painel admin a mostrar ONLINE** com estatísticas.

---

## 1. Enviar o código para o repositório (Git)

No Git Bash, na pasta do projeto (`c:\xampp\htdocs\NcApk`):

```bash
cd /c/xampp/htdocs/NcApk

git add .
git status
git commit -m "fix: build Railway (Docker + scripts) + API admin/stats + painel admin PHP"
git push origin main
```

(Se a sua branch for `master`, use `git push origin master`.)

---

## 2. Railway – Deploy

1. Abra **https://railway.com** e entre no projeto **nc-messenger** (ou o nome que tiver).
2. O Railway faz **deploy automático** após o push. Vá a **Deployments** e espere o build ficar **verde** (sucesso).
3. Se falhar, abra os **logs** do passo "Build image". As alterações feitas foram:
   - **Dockerfile**: copiar a pasta `scripts/` antes do `npm ci`, para o postinstall encontrar `patch-capacitor-java.js`.
   - **scripts/patch-capacitor-java.js**: em Docker/CI ou sem pasta `android`, o script sai sem erro.

---

## 3. Obter a URL do servidor no Railway

1. No Railway: projeto → serviço **nc-messenger**.
2. Aba **Settings** (ou **Deployments** → último deploy).
3. Em **Networking** / **Public Networking**, copie a **URL pública** (ex.: `https://nc-messenger-production.up.railway.app`).  
   Não inclua barra no final.

Teste no navegador:

- `https://SUA-URL-RAILWAY/api/health`  
  Deve devolver algo como: `{"ok":true,"service":"NC"}`.

---

## 4. Variáveis de ambiente no Railway (opcional mas útil)

No Railway → serviço nc-messenger → **Variables**. Confirme ou adicione:

| Variável | Descrição |
|----------|-----------|
| `NC_EMAIL_RELAY_URL` | URL do script PHP de envio de código (ex.: `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php`) |
| `NC_EMAIL_RELAY_SECRET` | Mesmo valor que `RELAY_SECRET` no PHP (ver frontend-php/LEIA-ME-RELAY.txt) |
| `NC_ADMIN_SECRET` | (Opcional) Segredo para o painel admin aceder a `/api/admin/stats`. Se usar, use o mesmo no PHP do admin. |

Guarde. O Railway faz redeploy ao alterar variáveis.

---

## 5. Painel Admin no seu site (Hostinger / claudeservices.com)

O ficheiro **`frontend-php/nc_messenger_admin.php`** já está no projeto. Faça o seguinte:

### 5.1 Enviar o ficheiro para o servidor

- Coloque `nc_messenger_admin.php` na pasta do seu site onde está o frontend (ex.: mesma pasta onde está `enviar_codigo_nc.php`).  
  Exemplo de caminho no Hostinger: `public_html/nc/claude/frontend/admin/nc_messenger_admin.php`.

### 5.2 Configurar a URL da API no admin

Abra `nc_messenger_admin.php` e edite no topo:

```php
if (!defined('NC_API_URL')) {
  define('NC_API_URL', 'https://SEU-PROJETO.up.railway.app');
}
```

Substitua `https://SEU-PROJETO.up.railway.app` pela **URL real** do Railway (a que copiou no passo 3), **sem barra no final**.

Exemplo:

```php
define('NC_API_URL', 'https://nc-messenger-production.up.railway.app');
```

### 5.3 (Opcional) Segredo do admin

Se definiu **NC_ADMIN_SECRET** no Railway, defina o mesmo no PHP:

```php
if (!defined('NC_ADMIN_SECRET')) {
  define('NC_ADMIN_SECRET', 'a_mesma_senha_que_no_railway');
}
```

Se não usar segredo, deixe `NC_ADMIN_SECRET` vazio no PHP e não defina `NC_ADMIN_SECRET` no Railway.

### 5.4 Abrir o painel

Aceda no browser a:

- `https://claudeservices.com/nc/claude/frontend/admin/nc_messenger_admin.php`  
  (ajuste ao caminho onde colocou o ficheiro.)

Deve ver:

- **Status do Servidor: ONLINE** (se o Railway estiver no ar e a URL estiver certa).
- **Usuários Registrados**, **Mensagens Enviadas**, **Sessões Ativas** com os números da base de dados do NC.

---

## 6. Resumo rápido

| O quê | Onde |
|-------|------|
| Código no Git | `git add .` → `git commit` → `git push origin main` |
| Deploy | Railway faz sozinho após o push; ver Deployments até ficar verde |
| URL do NC | Railway → serviço nc-messenger → Settings/Networking → copiar URL |
| Testar API | Abrir no browser: `https://SUA-URL-RAILWAY/api/health` |
| Painel admin | Colocar `nc_messenger_admin.php` no site e definir `NC_API_URL` com a URL do Railway |

Se o painel continuar a mostrar **OFFLINE**, confirme:

1. A URL em `NC_API_URL` é exatamente a do Railway (sem barra no final).
2. O último deploy no Railway está verde.
3. No browser, `https://SUA-URL-RAILWAY/api/health` devolve `{"ok":true,"service":"NC"}`.
