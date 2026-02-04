/**
 * NC - Servidor principal
 * Componentes: API REST, XMPP (WebSocket), MMS (uploads), Push Notifications.
 */

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { initDb, getDb } from './../db/init';
import { initPush } from '../services/push';
import { initEmail } from '../services/email';
import { registerXMPPClient } from '../services/xmpp';
import { getUploadDir } from '../services/mms';

import authRoutes from '../routes/auth';
import userRoutes from '../routes/users';
import messageRoutes from '../routes/messages';
import pushRoutes from '../routes/push';
import mmsRoutes from '../routes/mms';
import { getAdminStats } from '../db/stats';

// Carregar variáveis de ambiente do arquivo .env
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
  console.log('✅ Arquivo .env carregado!');
} else {
  console.log('⚠️  Arquivo .env não encontrado');
}

console.log('\n🚀 NC - Servidor de Mensagens Instantâneas\n');

const PORT = parseInt(process.env.PORT ?? '3000', 10);

// Inicializar banco (em produção falhar aqui evita SIGTERM obscuro no Railway)
try {
  getDb(); // cria pasta data se não existir
  initDb();
} catch (e) {
  console.error('Erro ao inicializar banco:', e);
  process.exit(1);
}

initEmail();
initPush();

const app = express();
app.use(cors());
app.use(express.json());

// Uploads estáticos (MMS)
app.use('/uploads', express.static(getUploadDir()));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/mms', mmsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'NC' });
});

// Estatísticas para o painel admin (protegido por NC_ADMIN_SECRET se definido)
app.get('/api/admin/stats', (req, res) => {
  const secret = process.env.NC_ADMIN_SECRET;
  if (secret && req.query.secret !== secret && req.get('X-Admin-Secret') !== secret) {
    res.status(403).json({ error: 'Acesso negado' });
    return;
  }
  try {
    res.json(getAdminStats());
  } catch (e) {
    console.error('admin/stats:', e);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Cliente web
const clientPath = path.join(__dirname, '..', '..', 'public');
const apkPath = path.join(clientPath, 'apk', 'nc-messenger.apk');

app.use(express.static(clientPath));
app.get('/', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));
app.get('/login', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));
app.get('/chat*', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));

// Página de download do APK
app.get('/download', (_req, res) => res.sendFile(path.join(clientPath, 'download.html')));
app.get('/download/nc-messenger.apk', (req, res) => {
  if (!fs.existsSync(apkPath)) {
    res.status(404).type('text/plain').send('APK ainda não gerado. Execute o build do Android (ver ANDROID-BUILD.md).');
    return;
  }
  res.setHeader('Content-Disposition', 'attachment; filename="nc-messenger.apk"');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.sendFile(apkPath);
});

const server = http.createServer(app);

// WebSocket XMPP
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  registerXMPPClient(ws);
});

// Em produção (Railway, etc.) o proxy precisa alcançar o app: escutar em 0.0.0.0
const HOST = process.env.HOST ?? '0.0.0.0';

server.listen(Number(PORT), HOST, () => {
  console.log(`Servidor NC em http://${HOST}:${PORT}`);
  console.log('  - API: /api/auth, /api/users, /api/messages, /api/push, /api/mms');
  console.log('  - WebSocket (XMPP): /ws');
  console.log('  - Uploads: /uploads');
});

// Evitar que erros não tratados derrubem o processo sem log (útil no Railway)
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection:', reason, promise);
});
