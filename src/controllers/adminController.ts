import db from '../db.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: any, res: any) => {
    try {
        const users = db.prepare('SELECT id, name, email, role, company_name, created_at FROM users ORDER BY created_at DESC').all();
        res.json(users);
    } catch (error: any) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const createUser = async (req: any, res: any) => {
    try {
        const { name, email, password, role, company_name } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nom, email et mot de passe requis." });
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const stmt = db.prepare(`
            INSERT INTO users (name, email, password, role, company_name)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(name, email, hashedPassword, role || 'student', company_name || null);
        
        res.status(201).json({ message: "Utilisateur créé", userId: result.lastInsertRowid });
    } catch (error: any) {
        console.error("Create user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateUser = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { name, email, role, company_name } = req.body;

        const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

        db.prepare(`
            UPDATE users 
            SET name = ?, email = ?, role = ?, company_name = ?, updated_at = datetime('now')
            WHERE id = ?
        `).run(name, email, role, company_name || null, id);

        res.json({ message: "Utilisateur mis à jour avec succès." });
    } catch (error: any) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const deleteUser = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        
        // Supprimer en cascade logiquement: pour l'instant direct suppression
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        
        res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error: any) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getPlatformStats = async (req: any, res: any) => {
    try {
        const usersCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const studentsCount: any = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "student"').get();
        const companiesCount: any = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "company"').get();
        
        const offersCount: any = db.prepare('SELECT COUNT(*) as count FROM offers').get();
        const activeOffersCount: any = db.prepare('SELECT COUNT(*) as count FROM offers WHERE status = "active"').get();
        
        const applicationsCount: any = db.prepare('SELECT COUNT(*) as count FROM applications').get();
        const pendingApplications: any = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = "pending"').get();
        const acceptedApplications: any = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = "accepted"').get();
        const rejectedApplications: any = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = "rejected"').get();

        res.json({
            users: {
                total: usersCount.count,
                students: studentsCount.count,
                companies: companiesCount.count
            },
            offers: {
                total: offersCount.count,
                active: activeOffersCount.count
            },
            applications: {
                total: applicationsCount.count,
                pending: pendingApplications.count,
                accepted: acceptedApplications.count,
                rejected: rejectedApplications.count
            }
        });
    } catch (error: any) {
        console.error("Get platform stats error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
