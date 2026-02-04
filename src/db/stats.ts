/**
 * NC - Estatísticas para o painel admin (usuários, mensagens, sessões ativas)
 */

import { getDb } from './init';

export interface AdminStats {
  users: number;
  messages: number;
  sessions: number;
}

export function getAdminStats(): AdminStats {
  const db = getDb();
  const users = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;
  const messages = (db.prepare('SELECT COUNT(*) as n FROM messages').get() as { n: number }).n;
  const sessions = (
    db.prepare('SELECT COUNT(*) as n FROM sessions WHERE expires_at > ?').get(Date.now()) as { n: number }
  ).n;
  return { users, messages, sessions };
}
