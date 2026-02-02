# Código de verificação não chega no email – diagnóstico

Quando você pede o código no NC Messenger e a tela mostra "Enviamos um código para...", mas o email **não chega**, siga estes passos.

---

## 1. O que mudou no servidor

Agora, quando o **envio falha**, a API responde com erro **503** e a mensagem **"Falha ao enviar código"**.  
Ou seja:

- Se aparecer **"Falha ao enviar código"** na tela → o servidor tentou enviar e o SMTP falhou. Siga o passo 2 (logs no Railway).
- Se **não** aparecer essa mensagem e mesmo assim o email não chegar → pode ser filtro (spam) ou atraso; veja o passo 3.

---

## 2. Ver o erro real nos logs do Railway

1. Abra o **Railway** → projeto → serviço **servidor nc-messenger** → aba **Logs** (Registros).
2. Peça um novo código no NC Messenger (na tela de verificação).
3. Nos logs, procure **na hora em que você clicou**:
   - **"✅ Email enviado com sucesso!"** → o servidor enviou; o problema pode ser spam/atraso (passo 3).
   - **"❌ ERRO ao enviar email:"** → anote a **Mensagem** e o **Código** que aparecem logo abaixo.

Interpretação rápida:

| Mensagem / código no log | Provável causa |
|--------------------------|----------------|
| `Invalid login` / `EAUTH` | Usuário ou senha SMTP errados. Confira `NC_SMTP_USER` e `NC_SMTP_PASS` (mesma conta do recuperar senha). |
| `Connection refused` / `ECONNREFUSED` | Hostinger bloqueando conexão do Railway ou porta errada. Use porta **587** e confira `NC_SMTP_HOST`. |
| `ETIMEDOUT` | Rede/firewall bloqueando. Hostinger pode não permitir SMTP a partir de IPs do Railway. |
| `Self signed certificate` | Menos comum com `rejectUnauthorized: false`. Se aparecer, dá para tratar depois. |

Com o texto exato do log fica possível corrigir a causa (credenciais, porta, ou necessidade de outro provedor de email).

---

## 3. Verificar caixa de entrada e spam

- Confira a pasta **Spam / Lixo eletrônico** do **nclaudelove@gmail.com**.
- Procure por remetente **nc@claudeservices.com** ou assunto **"[NC] Código de verificação"**.
- Às vezes o email demora 1–2 minutos; espere um pouco e atualize a caixa de entrada.

---

## 4. Conferir variáveis no Railway (igual ao recuperar senha)

No Railway → **servidor nc-messenger** → **Variables**, confira:

| Variável        | Valor esperado                          |
|-----------------|------------------------------------------|
| `NC_SMTP_HOST`  | `smtp.hostinger.com`                    |
| `NC_SMTP_PORT`  | `587`                                   |
| `NC_SMTP_USER`  | `nc@claudeservices.com`                 |
| `NC_SMTP_PASS`  | **Mesma senha** do `email_config_outlook.php` (OUTLOOK_PASSWORD) |
| `NC_EMAIL_FROM` | `Claude Services <nc@claudeservices.com>` |

Depois de alterar, salve e espere o redeploy. Teste de novo e olhe os logs (passo 2).

---

## 5. Hostinger bloqueando SMTP do Railway

Alguns provedores só aceitam SMTP a partir do próprio servidor (ex.: só do Hostinger). Se nos logs aparecer **connection refused** ou **timeout** mesmo com usuário/senha corretos, é possível que o Hostinger **não permita** envio a partir dos IPs do Railway.

Nesse caso:

- Você pode perguntar ao suporte da Hostinger se é permitido usar **smtp.hostinger.com** de um servidor externo (Railway).
- Ou usar um serviço de email para apps (SendGrid, Mailgun, Resend, etc.) e configurar no NC com as variáveis desse serviço (host/porta/usuário/senha/remetente).

---

## Resumo

1. **Testar de novo** → se aparecer **"Falha ao enviar código"**, o problema é no envio (SMTP).
2. **Abrir os logs no Railway** no momento do envio e copiar a linha **"❌ ERRO ao enviar email"** e as linhas seguintes (Mensagem e Código).
3. **Conferir spam** e variáveis do Railway (passo 4).
4. Se o erro for de conexão/timeout, considerar **SMTP externo** (passo 5).

Com o texto exato do erro dos logs dá para afinar a configuração (credenciais, porta, host) ou decidir usar outro provedor de email.
