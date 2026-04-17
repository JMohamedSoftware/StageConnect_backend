import db from '../db.js';

export const createOffer = async (req: any, res: any) => {
    try {
        const { 
            title, description, requirements, location, duration, 
            domain, contractType, deadline, benefits, workMode,
            salary, startDate, level, experience, languages
        } = req.body;

        if (!title || !description || !location || !duration) {
            return res.status(400).json({ error: "Champs manquants." });
        }

        const stmt = db.prepare(`
            INSERT INTO offers (
                title, description, company_id, requirements, location, duration,
                domain, contract_type, deadline, benefits, work_mode,
                salary, start_date, level, experience, languages
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            title, description, req.user.id,
            JSON.stringify(requirements || []),
            location, duration,
            domain || 'General',
            contractType || 'Stage',
            deadline || null,
            JSON.stringify(benefits || []),
            workMode || 'Présentiel',
            salary || null,
            startDate || null,
            level || null,
            experience || null,
            languages || null
        );

        const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: "Offre créée avec succès", offer });
    } catch (error: any) {
        console.error("Create offer error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getAllOffers = async (req: any, res: any) => {
    try {
        const { search, domain, city, duration, contractType } = req.query;

        let query = `
            SELECT o.*, u.name as company_name_user, u.company_name as company_display_name, u.email as company_email
            FROM offers o
            LEFT JOIN users u ON o.company_id = u.id
            WHERE o.status = 'active'
        `;
        const params: any[] = [];

        if (search && typeof search === 'string' && search.trim()) {
            query += ` AND (o.title LIKE ? OR o.description LIKE ?)`;
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }
        if (domain && domain !== 'Domaine') {
            query += ` AND o.domain = ?`;
            params.push(domain);
        }
        if (city && city !== 'Ville') {
            query += ` AND o.location LIKE ?`;
            params.push(`%${city}%`);
        }
        if (duration && duration !== 'Durée') {
            query += ` AND o.duration = ?`;
            params.push(duration);
        }
        if (contractType && contractType !== 'Type de contrat') {
            query += ` AND o.contract_type = ?`;
            params.push(contractType);
        }

        query += ` ORDER BY o.created_at DESC`;

        const offers = db.prepare(query).all(...params);

        // Parse JSON fields
        const parsed = offers.map((o: any) => ({
            ...o,
            requirements: JSON.parse(o.requirements || '[]'),
            benefits: JSON.parse(o.benefits || '[]'),
            companyId: {
                _id: o.company_id,
                name: o.company_name_user,
                company_name: o.company_display_name,
                email: o.company_email
            }
        }));

        res.json(parsed);
    } catch (error: any) {
        console.error("Get offers error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getOfferById = async (req: any, res: any) => {
    try {
        const offer: any = db.prepare(`
            SELECT o.*, u.name as company_name_user, u.company_name as company_display_name, u.email as company_email
            FROM offers o LEFT JOIN users u ON o.company_id = u.id
            WHERE o.id = ?
        `).get(req.params.id);
        
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });
        
        offer.requirements = JSON.parse(offer.requirements || '[]');
        offer.benefits = JSON.parse(offer.benefits || '[]');
        offer.companyId = { _id: offer.company_id, name: offer.company_name_user, company_name: offer.company_display_name };
        
        res.json(offer);
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateOffer = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const offer: any = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });

        if (req.user.role !== 'admin' && offer.company_id !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        const fields = ['title','description','location','duration','domain','contract_type','deadline','work_mode','salary','status'];
        const updates: string[] = [];
        const values: any[] = [];

        for (const field of fields) {
            const bodyField = field === 'contract_type' ? 'contractType' : field === 'work_mode' ? 'workMode' : field;
            if (req.body[bodyField] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[bodyField]);
            }
        }

        if (updates.length === 0) return res.status(400).json({ error: "Aucun champ à mettre à jour." });

        values.push(id);
        db.prepare(`UPDATE offers SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);

        const updated = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
        res.json({ message: "Offre mise à jour", offer: updated });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const deleteOffer = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const offer: any = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });

        if (req.user.role !== 'admin' && offer.company_id !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        db.prepare('DELETE FROM offers WHERE id = ?').run(id);
        res.json({ message: "Offre supprimée." });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
