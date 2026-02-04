/**
 * NC - Rotas de autenticação e registro
 * Processo: envio de email -> verificação de código -> criação de conta -> login
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import {
  userExists,
  createUser,
  getUserByEmail,
  getUserById,
} from '../db/users';
import { setVerificationCode, verifyCode } from '../db/verifications';
import { createSession } from '../db/sessions';
import { sendVerificationCode } from '../services/email';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function randomCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// 1. Envio de email para registro
router.post('/register/email', async (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email obrigatório' });
    return;
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }
  if (userExists(normalized)) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }
  const code = randomCode();
  setVerificationCode(normalized, code);
  console.log('[auth] Enviando código para o email introduzido pelo utilizador:', normalized);
  let sent: boolean;
  try {
    sent = await sendVerificationCode(normalized, code);
  } catch (err) {
    console.error('[auth] Erro ao enviar código por email:', err);
    res.status(503).json({ error: 'Falha ao enviar código. Tente novamente ou verifique a configuração de email do servidor.' });
    return;
  }
  if (!sent) {
    console.warn('[auth] Falha ao enviar código por email (verifique SMTP/Resend).');
    res.status(503).json({ error: 'Falha ao enviar código. O servidor não conseguiu enviar o email. Verifique os logs no Railway ou configure Resend (veja EMAIL-RESEND-RAILWAY.md).' });
    return;
  }
  res.json({ ok: true, message: 'Código gerado; verifique seu email (e a pasta Spam).' });
});

// 2. Verificação de código e criação de conta
router.post('/register/verify', (req: Request, res: Response) => {
  const { email, code, name } = req.body || {};
  if (!email || !code || !name) {
    res.status(400).json({ error: 'email, code e name obrigatórios' });
    return;
  }
  const normalized = (email as string).trim().toLowerCase();
  const nameStr = (name as string).trim();
  if (nameStr.length < 2) {
    res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
    return;
  }
  const codeStr = String(code).trim();
  if (!verifyCode(normalized, codeStr)) {
    res.status(400).json({ error: 'Código inválido ou expirado. Peça um novo código na tela anterior e use o do email mais recente.' });
    return;
  }
  if (userExists(normalized)) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }
  const userId = uuidv4();
  createUser(userId, normalized, nameStr);
  const token = crypto.randomBytes(32).toString('hex');
  createSession(userId, token);
  const user = getUserById(userId)!;
  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
    },
  });
});

// Login (email + código ou token)
router.post('/login/email', async (req: Request, res: Response) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    res.status(400).json({ error: 'email e code obrigatórios' });
    return;
  }
  const normalized = (email as string).trim().toLowerCase();
  const user = getUserByEmail(normalized);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  if (!verifyCode(normalized, String(code).trim())) {
    res.status(400).json({ error: 'Código inválido ou expirado. Peça um novo código e use o do email mais recente.' });
    return;
  }
  const token = crypto.randomBytes(32).toString('hex');
  createSession(user.id, token);
  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
    },
  });
});

// Enviar código de login
router.post('/login/send-code', async (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Email obrigatório' });
    return;
  }
  const normalized = (email as string).trim().toLowerCase();
  const user = getUserByEmail(normalized);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  const code = randomCode();
  setVerificationCode(normalized, code);
  console.log('[auth] Enviando código de login para o email introduzido:', normalized);
  let sent: boolean;
  try {
    sent = await sendVerificationCode(normalized, code);
  } catch (err) {
    console.error('[auth] Erro ao enviar código de login por email:', err);
    res.status(503).json({ error: 'Falha ao enviar código. Tente novamente ou verifique a configuração de email do servidor.' });
    return;
  }
  if (!sent) {
    console.warn('[auth] Falha ao enviar código de login por email (verifique SMTP/Resend).');
    res.status(503).json({ error: 'Falha ao enviar código. O servidor não conseguiu enviar o email. Verifique os logs no Railway ou configure Resend (veja EMAIL-RESEND-RAILWAY.md).' });
    return;
  }
  res.json({ ok: true, message: 'Código de login gerado; verifique seu email (e a pasta Spam).' });
});

export default router;
