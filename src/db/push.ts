/**
 * NC - Assinaturas de Push Notification
 */

import { getDb } from './init';

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: number;
}

export function savePushSubscription(
  id: string,
  userId: string,
  endpoint: string,
  p256dh: string,
  auth: string
): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, userId, endpoint, p256dh, auth, Date.now());
}

export function getPushSubscriptionsForUser(userId: string): PushSubscriptionRow[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM push_subscriptions WHERE user_id = ?')
    .all(userId) as PushSubscriptionRow[];
}

export function deletePushSubscription(userId: string, endpoint: string): void {
  const db = getDb();
  db.prepare('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?').run(
    userId,
    endpoint
  );
}
