# Por que o código chega no Recuperar Senha mas não no NC Messenger?

## Resumo

| Onde | Servidor | Envio de email | Chega? |
|------|----------|----------------|--------|
| **Recuperar Senha** | Hostinger (claudeservices.com) | PHP usa SMTP do Hostinger **do mesmo servidor** | ✅ Sim |
| **NC Messenger** | Railway | Node usa SMTP do Hostinger **de outro servidor** (Railway) | ❌ Não |

O **Hostinger** (smtp.hostinger.com) normalmente só aceita envio de email quando a conexão vem **do próprio hosting**. Quando o NC Messenger (no Railway) tenta enviar, a conexão vem de outro datacenter e o Hostinger pode bloquear ou não entregar. Por isso no recuperar senha chega e no NC não.

---

## Solução: usar um serviço de email que aceite envio de qualquer servidor

Use um provedor que **aceita SMTP de qualquer IP** (ideal para apps em Railway, Vercel, etc.):

- **Resend** (recomendado): grátis até 3.000 emails/mês, funciona com Nodemailer.
- Alternativas: **SendGrid**, **Mailgun**, **Brevo** (ex-Sendinblue).

Abaixo: configuração com **Resend** no Railway.

---

## Passo a passo – Resend no Railway

### 1. Criar conta no Resend

1. Acesse **https://resend.com** e crie uma conta (grátis).
2. No painel: **API Keys** → **Create API Key** → copie a chave (só aparece uma vez).

### 2. Verificar remetente (para não cair em spam)

- **Opção A – Teste rápido:** Use o email de teste do Resend: **onboarding@resend.dev**  
  (só envia para o email da sua conta Resend no início; depois pode verificar seu domínio).
- **Opção B – Produção:** Em **Domains**, adicione **claudeservices.com** e configure os registros DNS que o Resend indicar. Depois use **nc@claudeservices.com** (ou outro @claudeservices.com) como remetente.

### 3. Variáveis no Railway (serviço **servidor nc-messenger** → **Variables**)

Substitua as variáveis de SMTP do Hostinger por estas do Resend:

| Variável | Valor |
|----------|--------|
| `NC_SMTP_HOST` | `smtp.resend.com` |
| `NC_SMTP_PORT` | `465` |
| `NC_SMTP_USER` | `resend` |
| `NC_SMTP_PASS` | **Sua API Key do Resend** (a chave que você copiou) |
| `NC_EMAIL_FROM` | `NC <onboarding@resend.dev>` (teste) ou `Claude Services <nc@claudeservices.com>` (após verificar o domínio) |

Salve. O Railway faz redeploy sozinho.

### 4. Testar

1. Abra o NC Messenger (nc-messenger-server-production.up.railway.app).
2. Digite o email (ex.: nclaudelove@gmail.com) e clique em **Continuar**.
3. Verifique a caixa de entrada (e Spam). Com Resend o código deve passar a chegar.

---

## Resumo das variáveis Resend (copiar)

```
NC_SMTP_HOST=smtp.resend.com
NC_SMTP_PORT=465
NC_SMTP_USER=resend
NC_SMTP_PASS=re_xxxxxxxxxxxx  (sua API Key)
NC_EMAIL_FROM=NC <onboarding@resend.dev>
```

Depois de verificar o domínio claudeservices.com no Resend, pode trocar para:

`NC_EMAIL_FROM=Claude Services <nc@claudeservices.com>`

Assim o NC Messenger passa a enviar por um serviço que aceita conexão do Railway e o código volta a chegar na caixa de entrada.
