/**
 * NC - Inicialização do banco de dados SQLite
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { SQL } from './schema';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'nc.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (_) {}
    _db = new Database(DB_PATH);
  }
  return _db;
}

export function initDb(): void {
  const db = getDb();
  db.exec(SQL.createUsers);
  db.exec(SQL.createEmailVerifications);
  db.exec(SQL.createSessions);
  db.exec(SQL.createMessages);
  db.exec(SQL.createPushSubscriptions);
  db.exec(SQL.createIndexes);
  console.log('Banco de dados NC inicializado em', DB_PATH);
}

if (require.main === module) {
  initDb();
}
