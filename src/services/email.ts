/**
 * NC - Serviço de email (envio de código de verificação)
 */

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function initEmail(config?: {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}): void {
  const host = config?.host ?? process.env.NC_SMTP_HOST ?? 'localhost';
  const port = config?.port ?? parseInt(process.env.NC_SMTP_PORT ?? '1025', 10);
  const user = config?.user ?? process.env.NC_SMTP_USER ?? '';
  const pass = config?.pass ?? process.env.NC_SMTP_PASS ?? '';
  const from = config?.from ?? process.env.NC_EMAIL_FROM ?? 'NC <noreply@nc.local>';

  console.log('🔧 Configurando SMTP:');
  console.log('  Host:', host);
  console.log('  Port:', port);
  console.log('  User:', user);
  console.log('  Pass:', pass ? '***' + pass.slice(-4) : '(vazio)');

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true para 465, false para outras portas
    auth: user ? { user, pass } : undefined,
    connectionTimeout: 20000, // 20s para evitar ETIMEDOUT em redes lentas (ex: Railway → Resend)
    greetingTimeout: 15000,
    tls: {
      rejectUnauthorized: false, // Permite certificados auto-assinados
    },
    ...(port === 587 && { requireTLS: true }), // Força STARTTLS para porta 587
  });

  console.log('✅ SMTP configurado!\n');
}

/** Envio via relay PHP no Hostinger - usa o mesmo SMTP do recuperar senha (conexão do próprio servidor) */
async function sendViaRelay(to: string, code: string): Promise<boolean> {
  const url = process.env.NC_EMAIL_RELAY_URL;
  const secret = process.env.NC_EMAIL_RELAY_SECRET;
  if (!url || !secret || url === '') return false;
  try {
    console.log(`📧 Enviando via relay (Hostinger) para ${to}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: to, code, secret }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; error_detail?: string };
    if (res.ok && data.ok) {
      console.log('✅ Email enviado com sucesso (relay Hostinger)!');
      return true;
    }
    console.error('❌ Relay falhou:', res.status, JSON.stringify(data));
    if (data.error_detail) {
      console.error('   error_detail:', data.error_detail, data.error_detail === 'smtp_auth' ? '→ Coloque a senha do nc@ em enviar_codigo_nc_config.php (OUTLOOK_PASSWORD)' : '');
    }
    return false;
  } catch (e: any) {
    console.error('❌ Erro relay:', e.message);
    return false;
  }
}

/** Envio via API do Resend (HTTPS) - evita ETIMEDOUT do SMTP em ambientes como Railway */
async function sendViaResendApi(to: string, code: string): Promise<boolean> {
  const apiKey = process.env.NC_RESEND_API_KEY || process.env.NC_SMTP_PASS;
  const from = process.env.NC_EMAIL_FROM ?? 'NC <onboarding@resend.dev>';
  if (!apiKey || !apiKey.startsWith('re_')) {
    return false;
  }
  try {
    console.log(`📧 Enviando via API Resend para ${to}...`);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: '[NC] Código de verificação',
        html: `<p>Seu código de verificação NC é: <strong>${code}</strong></p><p>Válido por 15 minutos.</p>`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('❌ Resend API:', res.status, data);
      return false;
    }
    console.log('✅ Email enviado com sucesso (Resend API)!');
    console.log('   Id:', (data as { id?: string }).id);
    return true;
  } catch (e: any) {
    console.error('❌ Erro Resend API:', e.message);
    return false;
  }
}

export async function sendVerificationCode(
  to: string,
  code: string
): Promise<boolean> {
  // O código só é entregue por email ao endereço digitado; não é mostrado no terminal.
  const hasRelay = !!(process.env.NC_EMAIL_RELAY_URL && process.env.NC_EMAIL_RELAY_SECRET);
  const hasResend = process.env.NC_RESEND_API_KEY?.startsWith('re_') || process.env.NC_SMTP_PASS?.startsWith('re_');
  const hasSmtp = !!process.env.NC_SMTP_HOST;

  if (!hasRelay && !hasResend && !hasSmtp) {
    console.error('❌ Email não configurado. O código só é enviado por email. Configure NC_EMAIL_RELAY_URL (relay Hostinger) ou NC_RESEND_API_KEY ou SMTP.');
    return false;
  }

  console.log(`📧 Enviando código por email para ${to}...`);

  // 1) Relay no Hostinger (mesmo SMTP do recuperar senha; Railway chama o PHP por HTTPS)
  if (process.env.NC_EMAIL_RELAY_URL && process.env.NC_EMAIL_RELAY_SECRET) {
    const ok = await sendViaRelay(to, code);
    if (ok) return true;
    console.log('⚠️  Relay falhou; tentando Resend/SMTP...');
  }

  // 2) Resend API (re_xxx)
  const apiKey = process.env.NC_RESEND_API_KEY || process.env.NC_SMTP_PASS;
  if (apiKey && String(apiKey).startsWith('re_')) {
    const ok = await sendViaResendApi(to, code);
    if (ok) return true;
    console.log('⚠️  Resend API falhou; tentando SMTP...');
  }

  // 3) SMTP direto (pode falhar no Railway se o provedor bloquear conexão externa)
  if (!transporter) {
    if (process.env.NC_SMTP_HOST) {
      console.log('⚠️  Transporter não inicializado, inicializando...');
      initEmail();
    }
  }
  if (!transporter) {
    console.error('❌ Falha ao inicializar transporter SMTP');
    return false;
  }

  try {
    console.log(`📧 Tentando enviar email (SMTP) para ${to}...`);
    const info = await transporter.sendMail({
      from: process.env.NC_EMAIL_FROM ?? 'NC <noreply@nc.local>',
      to,
      subject: '[NC] Código de verificação',
      text: `Seu código de verificação NC é: ${code}\n\nVálido por 15 minutos.`,
      html: `<p>Seu código de verificação NC é: <strong>${code}</strong></p><p>Válido por 15 minutos.</p>`,
    });
    console.log('✅ Email enviado com sucesso!');
    console.log('   MessageID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Verifique sua caixa de entrada (ou SPAM)!\n');
    return true;
  } catch (e: any) {
    console.error('\n❌ ERRO ao enviar email:');
    console.error('   Mensagem:', e.message);
    if (e.code) console.error('   Código:', e.code);
    if (e.response) console.error('   Response:', e.response);
    if (e.command) console.error('   Comando SMTP:', e.command);
    console.error('⚠️  Não foi possível enviar o email por SMTP.');
    return false;
  }
}
