/**
 * NC - Schema do banco de dados
 * Armazena usuários (email, nome, foto de perfil), mensagens e dados de sessão.
 */

export const SQL = {
  createUsers: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      profile_photo_url TEXT,
      public_key TEXT,
      created_at INTEGER NOT NULL,
      verified INTEGER DEFAULT 0
    )
  `,
  createEmailVerifications: `
    CREATE TABLE IF NOT EXISTS email_verifications (
      email TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `,
  createSessions: `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `,
  createMessages: `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL REFERENCES users(id),
      recipient_id TEXT NOT NULL REFERENCES users(id),
      body_encrypted TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      mms_url TEXT,
      created_at INTEGER NOT NULL,
      delivered_at INTEGER
    )
  `,
  createPushSubscriptions: `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `,
  createIndexes: `
    CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);
  `,
};
