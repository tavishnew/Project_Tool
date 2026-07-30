import { PGlite } from '@electric-sql/pglite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '.data');

// ponytail: file-based PGlite = zero-config Postgres, no external server/account.
export const db = new PGlite(dataDir);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id INTEGER NOT NULL REFERENCES users(id),
  color TEXT DEFAULT '#ff5a4e',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_members (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON project_members(user_id);
-- Migration: add status column to projects (for existing databases)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
-- Migration: cascade delete projects when owner deleted
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_owner_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS project_invites (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_invites_token ON project_invites(token);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS workspace_invites (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token ON workspace_invites(token);
`;

let ready;
export function initDb() {
  if (!ready) ready = db.exec(SCHEMA);
  return ready;
}
