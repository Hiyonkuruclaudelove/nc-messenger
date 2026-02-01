/**
 * NC - Middleware de autenticação (token Bearer)
 */

import { Request, Response, NextFunction } from 'express';
import { getUserIdByToken } from '../db/sessions';

export function authMiddleware(
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
): void {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : (req.query?.token as string);
  if (!token) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }
  const userId = getUserIdByToken(token);
  if (!userId) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
  req.userId = userId;
  next();
}
