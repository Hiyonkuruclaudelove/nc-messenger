/**
 * NC - Serviço XMPP (Extensible Messaging and Presence Protocol)
 * WebSocket para conexão dos clientes e envio/recebimento de mensagens em tempo real.
 */

import { WebSocket } from 'ws';
import { getUserIdByToken } from '../db/sessions';
import { getUserById } from '../db/users';
import { saveMessage, markDelivered, getMessageById, Message } from '../db/messages';
import { sendPushToUser } from './push';
import { v4 as uuidv4 } from 'uuid';

export type XMPPMessageType =
  | 'auth'
  | 'ping'
  | 'message'
  | 'delivered'
  | 'presence'
  | 'error';

export interface XMPPFrame {
  type: XMPPMessageType;
  payload?: unknown;
}

export interface AuthPayload {
  token: string;
}

export interface MessagePayload {
  recipientId: string;
  bodyEncrypted: string;
  type?: 'text' | 'mms';
  mmsUrl?: string;
}

export interface DeliveredPayload {
  messageId: string;
}

const clients = new Map<WebSocket, { ws: WebSocket; userId: string; lastPing: number }>();

export function getConnectedUserIds(): string[] {
  return Array.from(clients.values()).map((c) => c.userId);
}

export function isUserOnline(userId: string): boolean {
  return Array.from(clients.values()).some((c) => c.userId === userId);
}

export function registerXMPPClient(ws: WebSocket): void {
  let userId: string | null = null;

  ws.on('message', (raw: Buffer) => {
    try {
      const frame: XMPPFrame = JSON.parse(raw.toString());
      switch (frame.type) {
        case 'auth': {
          const { token } = (frame.payload as AuthPayload) || {};
          if (!token) {
            send(ws, { type: 'error', payload: { message: 'Token ausente' } });
            return;
          }
          const uid = getUserIdByToken(token);
          if (!uid) {
            send(ws, { type: 'error', payload: { message: 'Token inválido' } });
            return;
          }
          userId = uid;
          clients.set(ws, { ws, userId: uid, lastPing: Date.now() });
          send(ws, { type: 'auth', payload: { userId: uid } });
          break;
        }
        case 'ping':
          if (userId) {
            const c = clients.get(ws);
            if (c) c.lastPing = Date.now();
          }
          send(ws, { type: 'ping', payload: {} });
          break;
        case 'message': {
          if (!userId) {
            send(ws, { type: 'error', payload: { message: 'Não autenticado' } });
            return;
          }
          const p = frame.payload as MessagePayload;
          if (!p?.recipientId || !p?.bodyEncrypted) {
            send(ws, { type: 'error', payload: { message: 'recipientId e bodyEncrypted obrigatórios' } });
            return;
          }
          const recipient = getUserById(p.recipientId);
          if (!recipient) {
            send(ws, { type: 'error', payload: { message: 'Destinatário inválido' } });
            return;
          }
          const messageId = uuidv4();
          saveMessage(
            messageId,
            userId,
            p.recipientId,
            p.bodyEncrypted,
            p.type ?? 'text',
            p.mmsUrl
          );
          const msg: Message | undefined = getMessageById(messageId);
          const created = msg?.created_at ?? Date.now();
          const envelope = {
            messageId,
            senderId: userId,
            recipientId: p.recipientId,
            bodyEncrypted: p.bodyEncrypted,
            type: p.type ?? 'text',
            mmsUrl: p.mmsUrl,
            created_at: created,
          };
          deliverToRecipient(p.recipientId, envelope);
          sendPushToUser(p.recipientId, {
            title: 'Nova mensagem',
            messageId,
            senderId: userId,
          });
          send(ws, { type: 'message', payload: { ...envelope, status: 'sent' } });
          break;
        }
        case 'delivered': {
          const p = frame.payload as DeliveredPayload;
          if (p?.messageId) markDelivered(p.messageId);
          break;
        }
        default:
          send(ws, { type: 'error', payload: { message: 'Tipo desconhecido' } });
      }
    } catch (e) {
      send(ws, { type: 'error', payload: { message: 'Frame inválido' } });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
}

function send(ws: WebSocket, frame: XMPPFrame): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(frame));
  }
}

function deliverToRecipient(
  recipientId: string,
  envelope: {
    messageId: string;
    senderId: string;
    recipientId: string;
    bodyEncrypted: string;
    type: string;
    mmsUrl?: string;
    created_at: number;
  }
): void {
  const frame: XMPPFrame = { type: 'message', payload: envelope };
  for (const c of clients.values()) {
    if (c.userId === recipientId && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(JSON.stringify(frame));
    }
  }
}

export function broadcastPresence(): void {
  const online = getConnectedUserIds();
  const frame: XMPPFrame = { type: 'presence', payload: { userIds: online } };
  for (const c of clients.values()) {
    if (c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(JSON.stringify(frame));
    }
  }
}
