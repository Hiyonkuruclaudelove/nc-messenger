/**
 * NC - Repositório de mensagens (armazenamento cifrado ponta a ponta)
 */

import { getDb } from './init';

export type MessageType = 'text' | 'mms';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body_encrypted: string;
  type: MessageType;
  mms_url: string | null;
  created_at: number;
  delivered_at: number | null;
}

export function saveMessage(
  id: string,
  senderId: string,
  recipientId: string,
  bodyEncrypted: string,
  type: MessageType = 'text',
  mmsUrl?: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO messages (id, sender_id, recipient_id, body_encrypted, type, mms_url, created_at, delivered_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`
  ).run(id, senderId, recipientId, bodyEncrypted, type, mmsUrl || null, Date.now());
}

export function getMessagesForUser(
  userId: string,
  limit: number = 100,
  before?: number
): Message[] {
  const db = getDb();
  const beforeTs = before ?? Date.now();
  const rows = db
    .prepare(
      `SELECT * FROM messages
       WHERE recipient_id = ? AND created_at < ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(userId, beforeTs, limit) as Message[];
  return rows;
}

export function getConversation(
  user1: string,
  user2: string,
  limit: number = 50,
  before?: number
): Message[] {
  const db = getDb();
  const beforeTs = before ?? Date.now();
  const rows = db
    .prepare(
      `SELECT * FROM messages
       WHERE ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
         AND created_at < ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .all(user1, user2, user2, user1, beforeTs, limit) as Message[];
  return rows;
}

export function markDelivered(messageId: string): void {
  const db = getDb();
  db.prepare('UPDATE messages SET delivered_at = ? WHERE id = ?').run(
    Date.now(),
    messageId
  );
}

export function getMessageById(id: string): Message | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as Message | undefined;
}
