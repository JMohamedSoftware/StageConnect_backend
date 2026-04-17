import db from '../db.js';

export const applyToOffer = async (req: any, res: any) => {
    try {
        const { offerId, coverLetter } = req.body;
        
        if (!offerId) {
            return res.status(400).json({ error: "L'ID de l'offre est requis." });
        }

        // Vérifier si l'offre existe
        const offer: any = db.prepare('SELECT id FROM offers WHERE id = ?').get(offerId);
        if (!offer) {
            return res.status(404).json({ error: "Offre introuvable." });
        }

        try {
            const stmt = db.prepare(`
                INSERT INTO applications (offer_id, student_id, cover_letter)
                VALUES (?, ?, ?)
            `);
            const result = stmt.run(offerId, req.user.id, coverLetter || null);
            
            res.status(201).json({ message: "Candidature envoyée avec succès.", applicationId: result.lastInsertRowid });
        } catch (dbError: any) {
            if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE' || dbError.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Vous avez déjà postulé à cette offre." });
            }
            throw dbError;
        }
    } catch (error: any) {
        console.error("Apply to offer error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getStudentApplications = async (req: any, res: any) => {
    try {
        const query = `
            SELECT a.id, a.offer_id, a.status, a.created_at as applied_at,
                   o.title as offer_title, o.location, o.duration,
                   u.company_name, u.name as company_user_name
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            JOIN users u ON o.company_id = u.id
            WHERE a.student_id = ?
            ORDER BY a.created_at DESC
        `;
        const applications = db.prepare(query).all(req.user.id);
        
        // Formater les données pour le front-end
        const formatted = applications.map((app: any) => ({
            id: app.id,
            offer_id: app.offer_id,
            offer_title: app.offer_title,
            company_name: app.company_name || app.company_user_name,
            location: app.location,
            duration: app.duration,
            status: app.status,
            applied_at: app.applied_at
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error("Get student applications error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getCompanyApplications = async (req: any, res: any) => {
    try {
        // L'admin peut voir toutes les candidatures, l'entreprise ne voit que les siennes
        let query = `
            SELECT a.id, a.offer_id, a.status, a.created_at as applied_at,
                   u.name, u.email as student_email, u.sector as speciality, u.company_name as university,
                   o.title as offer_title
            FROM applications a
            JOIN users u ON a.student_id = u.id
            JOIN offers o ON a.offer_id = o.id
        `;
        const params: any[] = [];

        if (req.user.role !== 'admin') {
            query += ` WHERE o.company_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY a.created_at DESC`;

        const applications = db.prepare(query).all(...params);
        res.json(applications);
    } catch (error: any) {
        console.error("Get company applications error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateApplicationStatus = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: "Statut invalide." });
        }

        // Vérifier que la candidature existe et que l'utilisateur a le droit de la modifier (entreprise propriétaire ou admin)
        const appDetails: any = db.prepare(`
            SELECT a.id, o.company_id 
            FROM applications a
            JOIN offers o ON a.offer_id = o.id
            WHERE a.id = ?
        `).get(id);

        if (!appDetails) {
            return res.status(404).json({ error: "Candidature introuvable." });
        }

        if (req.user.role !== 'admin' && appDetails.company_id !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé. Cette candidature ne concerne pas vos offres." });
        }

        db.prepare(`UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
        
        res.json({ message: "Statut mis à jour avec succès.", status });
    } catch (error: any) {
        console.error("Update application status error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
