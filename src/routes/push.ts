/**
 * NC - Registro de assinatura Push para notificações
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import { savePushSubscription } from '../db/push';

const router = Router();

router.use(authMiddleware);

router.post('/subscribe', (req: Request & { userId?: string }, res: Response) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: 'endpoint e keys (p256dh, auth) obrigatórios' });
    return;
  }
  const id = uuidv4();
  savePushSubscription(
    id,
    req.userId!,
    endpoint,
    keys.p256dh,
    keys.auth
  );
  res.json({ ok: true, id });
});

export default router;
