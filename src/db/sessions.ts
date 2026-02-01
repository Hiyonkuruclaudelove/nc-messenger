/**
 * NC - Sessões de autenticação
 */

import { getDb } from './init';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export function createSession(userId: string, token: string): void {
  const db = getDb();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;
  db.prepare(
    `INSERT INTO sessions (id, user_id, token, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), userId, token, now, expiresAt);
}

export function getUserIdByToken(token: string): string | null {
  const db = getDb();
  const row = db
    .prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?'
    )
    .get(token, Date.now()) as { user_id: string } | undefined;
  return row ? row.user_id : null;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteUserSessions(userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}
