/**
 * NC - Push Notification Service
 * Envia notificações quando o usuário recebe mensagens.
 */

import webpush from 'web-push';
import { getPushSubscriptionsForUser } from '../db/push';
import { getUserById } from '../db/users';

let pushInitialized = false;

export function initPush(): void {
  const vapidPublic = process.env.NC_VAPID_PUBLIC;
  const vapidPrivate = process.env.NC_VAPID_PRIVATE;
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(
      'mailto:noreply@nc.local',
      vapidPublic,
      vapidPrivate
    );
    pushInitialized = true;
  } else {
    const keys = webpush.generateVAPIDKeys();
    console.warn(
      'NC Push: VAPID não configurado. Use estas chaves em produção:'
    );
    console.warn('NC_VAPID_PUBLIC=', keys.publicKey);
    console.warn('NC_VAPID_PRIVATE=', keys.privateKey);
    webpush.setVapidDetails('mailto:noreply@nc.local', keys.publicKey, keys.privateKey);
    pushInitialized = true;
  }
}

export interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  messageId?: string;
  senderId?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!pushInitialized) initPush();
  const subs = getPushSubscriptionsForUser(userId);
  const sender = getUserById(payload.senderId ?? '');
  const title = payload.title || (sender ? `Nova mensagem de ${sender.name}` : 'Nova mensagem');
  const body = payload.body ?? 'Toque para abrir.';
  const data = {
    title,
    body,
    url: payload.url ?? '/',
    messageId: payload.messageId,
    senderId: payload.senderId,
  };
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(data),
        { TTL: 60 }
      );
    } catch (e) {
      console.error('Push falhou para', userId, e);
    }
  }
}
