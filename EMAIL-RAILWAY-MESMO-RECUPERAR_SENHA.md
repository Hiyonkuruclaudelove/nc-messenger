# Email do NC Messenger = mesma configuração do Recuperar Senha

Para o código de verificação do NC Messenger chegar na caixa de entrada, use **exatamente** a mesma configuração de email do recuperar senha do site:

**https://claudeservices.com/nc/claude/frontend/recuperar_senha.php**

A configuração está em: `claude/backend/email_config_outlook.php`

---

## Variáveis no Railway (serviço **servidor nc-messenger** → **Variables**)

Configure estas variáveis com os **mesmos valores** do arquivo `email_config_outlook.php`:

| Variável        | Valor exato                    | Observação |
|-----------------|---------------------------------|------------|
| `NC_SMTP_HOST`  | `smtp.hostinger.com`           | Igual ao OUTLOOK_HOST |
| `NC_SMTP_PORT`  | `587`                          | **Porta 587**, não 465 (igual ao OUTLOOK_PORT) |
| `NC_SMTP_USER`  | `nc@claudeservices.com`        | Igual ao OUTLOOK_USERNAME |
| `NC_SMTP_PASS`  | *(a mesma senha do OUTLOOK_PASSWORD)* | Copie a senha de `email_config_outlook.php` (OUTLOOK_PASSWORD) |
| `NC_EMAIL_FROM` | `Claude Services <nc@claudeservices.com>` | Remetente igual ao do recuperar senha |

---

## Passo a passo no Railway

1. Abra o projeto no **Railway** e clique no serviço **servidor nc-messenger**.
2. Vá na aba **Variables** (Variáveis).
3. Ajuste ou crie cada variável:
   - **NC_SMTP_HOST** → `smtp.hostinger.com`
   - **NC_SMTP_PORT** → `587`
   - **NC_SMTP_USER** → `nc@claudeservices.com`
   - **NC_SMTP_PASS** → cole a **mesma senha** que está em `email_config_outlook.php` na linha `OUTLOOK_PASSWORD`
   - **NC_EMAIL_FROM** → `Claude Services <nc@claudeservices.com>`
4. Salve. O Railway faz um novo deploy automaticamente.
5. Depois do deploy, teste de novo o envio do código no NC Messenger; o email deve chegar na mesma caixa que o do recuperar senha.

---

## Por que pode não estar chegando

- **Porta errada:** usar **587** (STARTTLS), não 465.
- **Conta errada:** usar **nc@claudeservices.com**, não noreply@.
- **Senha diferente:** a senha no Railway tem de ser **idêntica** à do `OUTLOOK_PASSWORD` no PHP.

Com essas variáveis iguais ao recuperar senha, o NC usa o mesmo SMTP e o mesmo remetente, e o código deve chegar na caixa de entrada.
