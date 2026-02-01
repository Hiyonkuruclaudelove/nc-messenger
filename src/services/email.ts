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
    tls: {
      rejectUnauthorized: false, // Permite certificados auto-assinados
    },
    ...(port === 587 && { requireTLS: true }), // Força STARTTLS para porta 587
  });

  console.log('✅ SMTP configurado!\n');
}

export async function sendVerificationCode(
  to: string,
  code: string
): Promise<boolean> {
  // SEMPRE mostrar código no terminal (mesmo se enviar email)
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║      CÓDIGO DE VERIFICAÇÃO NC          ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   Email: ${to.padEnd(30)}║`);
  console.log(`║   Código: ${code.padEnd(28)}║`);
  console.log('╚════════════════════════════════════════╝\n');

  // Modo desenvolvimento: apenas terminal
  if (!process.env.NC_SMTP_HOST || process.env.NC_SMTP_PASS === 'COLE_A_SENHA_AQUI') {
    console.log('ℹ️  Modo DEV: SMTP não configurado. Use o código acima!\n');
    return true;
  }

  // Tentar enviar email
  if (!transporter) {
    console.log('⚠️  Transporter não inicializado, inicializando...');
    initEmail();
  }
  if (!transporter) {
    console.error('❌ Falha ao inicializar transporter');
    console.log('ℹ️  Use o código mostrado acima!\n');
    return true;
  }

  try {
    console.log(`📧 Tentando enviar email para ${to}...`);
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
    console.log('\n⚠️  Não foi possível enviar o email.');
    console.log('ℹ️  Use o código mostrado no terminal acima!\n');
    return true; // Retorna true para não bloquear o usuário
  }
}
