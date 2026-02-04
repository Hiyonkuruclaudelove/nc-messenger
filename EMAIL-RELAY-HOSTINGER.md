# Usar o mesmo SMTP do recuperar senha com o NC no Railway

Se quiser **manter o Railway** para o servidor NC e que o **código de verificação chegue por email** usando o **mesmo servidor de email do recuperar senha** (Hostinger), use o **relay**: o Railway chama um script PHP no seu site; o PHP envia o email no próprio Hostinger. A conexão SMTP sai do Hostinger, por isso funciona.

## Resumo

| Onde | O quê |
|------|--------|
| **Railway** | Servidor NC (API, WebSocket, etc.) – continua igual |
| **Hostinger** | Script PHP `enviar_codigo_nc.php` – recebe pedido do Railway e envia o email com o mesmo SMTP do recuperar senha |
| **APK / Web** | Continuam a apontar para o Railway; nada muda para o utilizador |

## Passo a passo

### 1. Colocar o script no Hostinger

1. No seu PC, abra a pasta `frontend-php` do projeto e edite **`enviar_codigo_nc.php`**:
   - Na linha `define('RELAY_SECRET', ...)` coloque uma **senha forte** (ex.: gere em https://randomkeygen.com/ e copie uma “Code Key”).
   - Se o recuperar senha usa `email_config_outlook.php` noutra pasta, o script tenta carregar de `../backend/` ou `../../claude/backend/`. Se o seu ficheiro está noutro sítio, edite o array `$config_paths` no PHP e adicione o caminho correcto. Assim o script usa a mesma senha e host que o recuperar senha **sem duplicar a senha**.
   - Se **não** tiver esse ficheiro de config, no próprio `enviar_codigo_nc.php` preencha as constantes `OUTLOOK_HOST`, `OUTLOOK_PORT`, `OUTLOOK_USERNAME`, `OUTLOOK_PASSWORD` (os mesmos valores do recuperar senha).
2. Envie o ficheiro `enviar_codigo_nc.php` para o Hostinger (por exemplo na mesma pasta do `nc_messenger_download.php` ou onde está o frontend), por exemplo:
   - `public_html/nc/claude/frontend/enviar_codigo_nc.php`
3. A URL do relay será algo como:
   - `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php`  
   (ajuste ao caminho real onde colocou o ficheiro).

### 2. Variáveis no Railway

No **Railway** → projeto → serviço do servidor NC → **Variables**, adicione:

| Variável | Valor |
|----------|--------|
| `NC_EMAIL_RELAY_URL` | URL completa do script (ex.: `https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php`) |
| `NC_EMAIL_RELAY_SECRET` | **Exactamente** o mesmo valor que colocou em `RELAY_SECRET` no PHP |

Salve. O Railway faz redeploy.

### 3. Testar

1. Abra o NC (web ou APK) que aponta ao Railway.
2. Digite o seu email e clique em Continuar.
3. O servidor NC no Railway chama o PHP no Hostinger; o PHP envia o email com o mesmo SMTP do recuperar senha.
4. Verifique a caixa de entrada (e Spam) do email.

## Ordem de envio no servidor NC

O servidor NC tenta enviar o código por esta ordem:

1. **Relay (Hostinger)** – se `NC_EMAIL_RELAY_URL` e `NC_EMAIL_RELAY_SECRET` estiverem definidos.
2. **Resend** – se tiver `NC_RESEND_API_KEY` (ou senha começada por `re_`).
3. **SMTP directo** – variáveis `NC_SMTP_*`.

Assim pode usar **só o relay** (mesmo SMTP do recuperar senha) e deixar o Railway e o APK a funcionar em produção.

## Segurança

- O `RELAY_SECRET` / `NC_EMAIL_RELAY_SECRET` garante que só o seu servidor NC (Railway) pode pedir o envio ao script PHP. Use uma senha longa e aleatória.
- Não partilhe esse valor nem o coloque em repositórios públicos.

## Resumo das variáveis (copiar)

No Railway, para usar **apenas** o relay (mesmo SMTP do recuperar senha):

```
NC_EMAIL_RELAY_URL=https://claudeservices.com/nc/claude/frontend/enviar_codigo_nc.php
NC_EMAIL_RELAY_SECRET=cole_a_mesma_senha_que_no_php
```

No PHP (Hostinger), no topo de `enviar_codigo_nc.php`:

```php
define('RELAY_SECRET', 'cole_a_mesma_senha_que_no_railway');
```

Com isto, o NC no Railway usa o mesmo SMTP do recuperar senha e o seu APK funciona de forma real com os emails a chegarem.
