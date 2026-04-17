import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'stageconnect-secret-key';

export const register = async (req: any, res: any) => {
    try {
        const { name, email, password, role, company_name } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Champs requis manquants." });
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) return res.status(400).json({ error: "Cet email est déjà utilisé." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const stmt = db.prepare(
            'INSERT INTO users (name, email, password, role, company_name) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(name, email, hashedPassword, role, role === 'company' ? (company_name || '') : null);

        res.status(201).json({ message: "Inscription réussie !", userId: result.lastInsertRowid });
    } catch (error: any) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Erreur lors de l'inscription: " + error.message });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });

        const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) return res.status(401).json({ error: "Identifiants invalides." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Identifiants invalides." });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: "Connexion réussie !",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_name: user.company_name || null
            }
        });
    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getMe = async (req: any, res: any) => {
    try {
        const user: any = db.prepare('SELECT id, name, email, role, company_name, cv_url FROM users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateProfile = async (req: any, res: any) => {
    try {
        const allowedFields = ['company_name','sector','size','website','contact_email','phone','address','city','zip','country','name'];
        const updates: string[] = [];
        const values: any[] = [];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: "Aucun champ à mettre à jour." });
        }
        values.push(req.user.id);
        db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
        const user = db.prepare('SELECT id, name, email, role, company_name FROM users WHERE id = ?').get(req.user.id);
        res.json({ message: "Profil mis à jour.", user });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
