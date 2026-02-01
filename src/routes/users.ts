/**
 * NC - Rotas de perfil e usuários
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUserById, setUserProfilePhoto, setUserName, setUserPublicKey } from '../db/users';
import { getUploadUrl } from '../services/mms';

const router = Router();

router.use(authMiddleware);

// Perfil do usuário autenticado
router.get('/me', (req: Request & { userId?: string }, res: Response) => {
  const user = getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    profile_photo_url: user.profile_photo_url,
    public_key: user.public_key,
  });
});

// Atualizar nome
router.patch('/me/name', (req: Request & { userId?: string }, res: Response) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Nome inválido' });
    return;
  }
  setUserName(req.userId!, name.trim());
  const user = getUserById(req.userId!);
  res.json({ name: user!.name });
});

// Registrar chave pública (E2E)
router.patch('/me/public-key', (req: Request & { userId?: string }, res: Response) => {
  const { public_key } = req.body || {};
  if (!public_key || typeof public_key !== 'string') {
    res.status(400).json({ error: 'public_key obrigatório' });
    return;
  }
  setUserPublicKey(req.userId!, public_key);
  res.json({ ok: true });
});

// Buscar usuário por ID (para chat)
router.get('/:id', (req: Request & { userId?: string }, res: Response) => {
  const user = getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    profile_photo_url: user.profile_photo_url,
    public_key: user.public_key,
  });
});

// Atualizar URL da foto (após upload MMS)
export function setProfilePhotoFromFilename(userId: string, filename: string): void {
  setUserProfilePhoto(userId, getUploadUrl(filename));
}

export default router;
