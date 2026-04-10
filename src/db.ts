import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../stageconnect.db');

const db = new Database(DB_PATH);

// Activer WAL pour de meilleures performances
db.pragma('journal_mode = WAL');

// ── Créer les tables si elles n'existent pas ──────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'student',
    company_name TEXT,
    cv_url      TEXT,
    sector      TEXT,
    size        TEXT,
    website     TEXT,
    contact_email TEXT,
    phone       TEXT,
    address     TEXT,
    city        TEXT,
    zip         TEXT,
    country     TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS offers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    company_id    INTEGER NOT NULL REFERENCES users(id),
    requirements  TEXT DEFAULT '[]',
    location      TEXT NOT NULL,
    duration      TEXT NOT NULL,
    domain        TEXT DEFAULT 'General',
    contract_type TEXT DEFAULT 'Stage',
    status        TEXT DEFAULT 'active',
    work_mode     TEXT DEFAULT 'Présentiel',
    salary        TEXT,
    start_date    TEXT,
    level         TEXT,
    experience    TEXT,
    languages     TEXT,
    benefits      TEXT DEFAULT '[]',
    deadline      TEXT,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  );
`);

console.log("✅ SQLite DB ready at", DB_PATH);

export default db;
