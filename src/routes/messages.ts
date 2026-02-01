/**
 * NC - Rotas do serviço de mensagens (histórico, lista)
 * O envio em tempo real é feito via XMPP (WebSocket).
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getConversation, getMessagesForUser } from '../db/messages';
import { getUserById } from '../db/users';

const router = Router();

router.use(authMiddleware);

// Histórico de conversa entre dois usuários
router.get('/conversation/:otherId', (req: Request & { userId?: string }, res: Response) => {
  const otherId = req.params.otherId;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const before = req.query.before ? parseInt(req.query.before as string) : undefined;
  const messages = getConversation(req.userId!, otherId, limit, before);
  const list = messages.map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    recipient_id: m.recipient_id,
    body_encrypted: m.body_encrypted,
    type: m.type,
    mms_url: m.mms_url,
    created_at: m.created_at,
    delivered_at: m.delivered_at,
  }));
  res.json({ messages: list });
});

// Mensagens recebidas (inbox)
router.get('/inbox', (req: Request & { userId?: string }, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const before = req.query.before ? parseInt(req.query.before as string) : undefined;
  const messages = getMessagesForUser(req.userId!, limit, before);
  const list = messages.map((m) => {
    const sender = getUserById(m.sender_id);
    return {
      id: m.id,
      sender_id: m.sender_id,
      sender_name: sender?.name,
      body_encrypted: m.body_encrypted,
      type: m.type,
      mms_url: m.mms_url,
      created_at: m.created_at,
      delivered_at: m.delivered_at,
    };
  });
  res.json({ messages: list });
});

export default router;
