# Como configurar o envio de código no Hostinger

Guia passo a passo para colocar os ficheiros do relay no Hostinger. Assim o código de verificação é enviado por email (para o endereço que o utilizador digita) usando o mesmo servidor de email do recuperar senha.

---

## 1. Entrar no Hostinger

1. Abra **https://www.hostinger.pt** (ou .com) e faça login.
2. No painel, abra **Hospedagem** e clique no seu plano (ex.: o domínio **claudeservices.com**).

---

## 2. Abrir o Gestor de Ficheiros

1. No menu ou na página do hosting, procure **Ficheiros** ou **File Manager** (Gestor de Ficheiros).
2. Clique para abrir. Vai ver a estrutura de pastas do seu site (geralmente começa em `public_html`).

---

## 3. Ir à pasta onde está o NC

1. Dentro de `public_html`, navegue até à pasta onde já tem o **nc_messenger_download.php**.
   - Exemplo: `public_html` → `nc` → `claude` → `frontend`
   - Ou: `public_html` → `nc` → `frontend`
2. A pasta final deve ser a **mesma** onde está o ficheiro da página de download do NC (e, se tiver, o recuperar senha / frontend).

**Se ainda não tiver nenhuma pasta:** crie por exemplo `public_html/nc/claude/frontend` (ou `public_html/nc/frontend`) e use essa.

---

## 4. Enviar os dois ficheiros PHP

1. Na pasta escolhida (ex.: `frontend`), clique em **Upload** / **Enviar ficheiros**.
2. No seu PC, abra a pasta do projeto:
   - `C:\xampp\htdocs\NcApk\frontend-php\`
3. Selecione e envie estes **2 ficheiros**:
   - **enviar_codigo_nc.php**
   - **enviar_codigo_nc_config.php**
4. Espere o upload terminar. Se já existirem com o mesmo nome, confirme **substituir**.

---

## 5. Confirmar a URL do script

A URL do script será algo como:

- `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php`

Ajuste consoante a pasta que usou no passo 3:

| Pasta no Hostinger                    | URL do script |
|--------------------------------------|----------------|
| `public_html/nc/claude/frontend/`    | `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php` |
| `public_html/nc/frontend/`           | `https://claudeservices.com/nc/frontend/enviar_codigo_nc.php` |
| `public_html/frontend/`              | `https://claudeservices.com/frontend/enviar_codigo_nc.php` |

Guarde esta URL; vai precisar no Railway (e no .env se testar em localhost).

---

## 6. Configurar o Railway (e opcionalmente o .env local)

Para o servidor NC enviar o código através do Hostinger:

1. **Railway:** Projeto → serviço do servidor NC → **Variables**.
2. Adicione:
   - **NC_EMAIL_RELAY_URL** = a URL do passo 5 (ex.: `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php`).
   - **NC_EMAIL_RELAY_SECRET** = o valor que está no ficheiro **RELAY-SECRET-GERADO.txt** (na pasta `frontend-php` do projeto).
3. Guarde. O Railway faz redeploy sozinho.

**Em localhost:** no ficheiro `.env` na pasta do projeto, adicione as mesmas duas variáveis com os mesmos valores e reinicie o servidor.

---

## 7. Senha do email (se o código não chegar)

O **enviar_codigo_nc_config.php** que você enviou já tem a senha do **nc@claudeservices.com** definida. Se um dia mudar a senha desse email:

1. No seu PC, edite `frontend-php/enviar_codigo_nc_config.php` e altere a linha `OUTLOOK_PASSWORD` para a nova senha.
2. Envie de novo o **enviar_codigo_nc_config.php** para a **mesma pasta** no Hostinger (substituir o ficheiro).

---

## Resumo rápido

| Onde        | O quê |
|------------|--------|
| **Hostinger** | Upload de `enviar_codigo_nc.php` e `enviar_codigo_nc_config.php` na pasta do frontend (mesma do nc_messenger_download.php). |
| **Railway**   | Variáveis `NC_EMAIL_RELAY_URL` (URL do script) e `NC_EMAIL_RELAY_SECRET` (valor de RELAY-SECRET-GERADO.txt). |
| **Localhost** | No `.env`, as mesmas duas variáveis; reiniciar o servidor. |

Depois disso, o único caminho para receber o código é no **email** que o utilizador digita (enviado pelo Hostinger, mesmo SMTP do recuperar senha).
