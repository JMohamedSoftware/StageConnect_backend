import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../stageconnect.db');

const db = new Database(DB_PATH);

async function testRegister() {
    try {
        const name = "Test User";
        const email = "test" + Date.now() + "@example.com";
        const password = "password123";
        const role = "student";
        const company_name = null;

        const hashedPassword = await bcrypt.hash(password, 10);

        const stmt = db.prepare(`
            INSERT INTO users (name, email, password, role, company_name)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(name, email, hashedPassword, role, company_name);
        console.log("Registration successful:", result);
    } catch (error) {
        console.error("Registration failed:", error);
    }
}

testRegister();
