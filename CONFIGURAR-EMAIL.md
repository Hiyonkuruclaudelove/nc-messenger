# 📧 Como configurar email REAL (Gmail)

## ⚠️ IMPORTANTE: Por enquanto, use o código que aparece no TERMINAL!

No modo de desenvolvimento, o código aparece na janela preta (CMD) onde você rodou `iniciar.bat`.

---

## Se você REALMENTE quer enviar emails:

### Passo 1: Ativar verificação em 2 etapas no Gmail

1. Acesse: https://myaccount.google.com/security
2. Procure por "Verificação em duas etapas"
3. Ative se ainda não estiver ativo

### Passo 2: Gerar senha de app

1. Acesse: https://myaccount.google.com/apppasswords
2. Em "Selecionar app", escolha "Outro (nome personalizado)"
3. Digite: `NC Messenger`
4. Clique em "Gerar"
5. **COPIE A SENHA** de 16 caracteres (ex: `abcd efgh ijkl mnop`)

### Passo 3: Configurar o arquivo `.env`

Abra o arquivo `.env` (na pasta do projeto) e edite:

```env
PORT=3000

# Descomente e preencha:
NC_SMTP_HOST=smtp.gmail.com
NC_SMTP_PORT=587
NC_SMTP_USER=nclaudelove@gmail.com
NC_SMTP_PASS=sua-senha-de-app-aqui
NC_EMAIL_FROM=NC <nclaudelove@gmail.com>
```

**Substitua:**
- `nclaudelove@gmail.com` → seu email
- `sua-senha-de-app-aqui` → a senha de 16 caracteres gerada

### Passo 4: Reiniciar o servidor

1. Feche o terminal (Ctrl+C)
2. Execute novamente `iniciar.bat`
3. Agora os emails chegarão na sua caixa de entrada! ✅

---

## 🚀 Mais fácil: Continue usando o modo DEV

**Recomendação:** Para testar, é MUITO mais rápido usar o código que aparece no terminal!

Os emails podem:
- Demorar 1-2 minutos para chegar
- Ir para SPAM
- Gmail pode bloquear se enviar muitos códigos

**O código no terminal é instantâneo!** 💨

---

## 🔍 Onde ver o código no terminal?

Procure na janela preta por:

```
╔════════════════════════════════════════╗
║   CÓDIGO DE VERIFICAÇÃO (DEV MODE)     ║
╠════════════════════════════════════════╣
║   Email: nclaudelove@gmail.com         ║
║   Código: 123456                       ║  ← ESTE!
╚════════════════════════════════════════╝
```

Copie `123456` e cole no navegador!
