# Configurar envio de código para o email que o utilizador introduz

O código de verificação é **sempre enviado para o email que o utilizador escreve** na primeira ecrã (registro ou login). O servidor usa as **configurações do seu domínio** (SMTP) para enviar esse email.

## O que já está correto no código

- O servidor envia o código **para** o email que vem no pedido (o que o utilizador introduziu).
- O remetente (**De**) é o email do domínio que configurar em `NC_EMAIL_FROM`.
- Na app, a tela de verificação mostra o **mesmo** email que foi introduzido.

## O que tem de configurar no servidor

No servidor onde o NC está em produção (ex.: Railway, VPS, Hostinger Node), crie ou edite o ficheiro **`.env`** com as variáveis do **seu domínio** (ex.: Hostinger):

```env
# SMTP do domínio (ex.: Hostinger - email nc@claudeservices.com)
NC_SMTP_HOST=smtp.hostinger.com
NC_SMTP_PORT=587
NC_SMTP_USER=nc@claudeservices.com
NC_SMTP_PASS=senha_do_email_nc
NC_EMAIL_FROM=Claude Services <nc@claudeservices.com>
```

- **NC_SMTP_*** → servidor e conta que **enviam** o email (use o mesmo que configurou para o domínio, ex. nc@claudeservices.com).
- **NC_EMAIL_FROM** → o endereço que aparece como “De” no email recebido (recomendado: email do domínio).
- O **destinatário** do código é sempre o email que o utilizador introduz na app; não se configura no .env.

## Resumo

| O que | Onde se configura |
|-------|-------------------|
| **Para onde** vai o código | Na app: o email que o utilizador escreve na primeira ecrã |
| **De onde** sai o email (SMTP) | No servidor: `.env` com NC_SMTP_* e NC_EMAIL_FROM do domínio |

Depois de gravar o `.env`, reinicie o servidor NC para as alterações terem efeito.
