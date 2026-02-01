/**
 * NC - Repositório de usuários
 */

import { getDb } from './init';

export interface User {
  id: string;
  email: string;
  name: string;
  profile_photo_url: string | null;
  public_key: string | null;
  created_at: number;
  verified: number;
}

export function createUser(
  id: string,
  email: string,
  name: string,
  publicKey?: string
): void {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO users (id, email, name, profile_photo_url, public_key, created_at, verified)
     VALUES (?, ?, ?, NULL, ?, ?, 1)`
  );
  stmt.run(id, email.toLowerCase(), name, publicKey || null, Date.now());
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  return row;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User | undefined;
  return row;
}

export function setUserPublicKey(userId: string, publicKey: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET public_key = ? WHERE id = ?').run(publicKey, userId);
}

export function setUserProfilePhoto(userId: string, url: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET profile_photo_url = ? WHERE id = ?').run(url, userId);
}

export function setUserName(userId: string, name: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
}

export function userExists(email: string): boolean {
  return getUserByEmail(email) !== undefined;
}
