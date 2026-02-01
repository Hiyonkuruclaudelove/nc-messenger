/**
 * NC - Upload MMS (fotos, vídeos, áudio)
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload, getUploadUrl } from '../services/mms';
import { setUserProfilePhoto } from '../db/users';

const router = Router();

router.use(authMiddleware);

router.post(
  '/upload',
  upload.single('file'),
  (req: Request & { userId?: string; file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }
    const url = getUploadUrl(req.file.filename);
    res.json({ url, filename: req.file.filename });
  }
);

// Upload de foto de perfil (salva e atualiza usuário)
router.post(
  '/profile-photo',
  upload.single('file'),
  (req: Request & { userId?: string; file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }
    const url = getUploadUrl(req.file.filename);
    setUserProfilePhoto(req.userId!, url);
    res.json({ url, profile_photo_url: url });
  }
);

export default router;
