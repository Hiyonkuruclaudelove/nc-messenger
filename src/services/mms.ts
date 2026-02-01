/**
 * NC - MMS (Multimedia Messaging Service)
 * Upload e entrega de arquivos multimídia (fotos, vídeos).
 */

import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (_) {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/|^video\/|^audio\//;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens, vídeos e áudio são permitidos'));
    }
  },
});

export function getUploadUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export function getUploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}
