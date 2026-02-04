/**
 * NC - Códigos de verificação de email
 */

import { getDb } from './init';

const CODE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutos (tempo para o email chegar)

export function setVerificationCode(email: string, code: string): void {
  const db = getDb();
  const now = Date.now();
  const expiresAt = now + CODE_EXPIRY_MS;
  db.prepare(
    `INSERT OR REPLACE INTO email_verifications (email, code, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(email.toLowerCase(), code, expiresAt, now);
}

export function verifyCode(email: string, code: string): boolean {
  const db = getDb();
  const row = db
    .prepare(
      'SELECT code, expires_at FROM email_verifications WHERE email = ?'
    )
    .get(email.toLowerCase()) as { code: string; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) return false;
  const ok = row.code === String(code).trim();
  if (ok) {
    db.prepare('DELETE FROM email_verifications WHERE email = ?').run(
      email.toLowerCase()
    );
  }
  return ok;
}

export function deleteVerification(email: string): void {
  const db = getDb();
  db.prepare('DELETE FROM email_verifications WHERE email = ?').run(
    email.toLowerCase()
  );
}
