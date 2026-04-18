import Application from '../models/Application.js';
import Offer from '../models/Offer.js';

export const applyToOffer = async (req: any, res: any) => {
    try {
        console.log("Candidature reçue - body:", req.body);
        console.log("Candidature reçue - file:", req.file);

        const offerId = req.body.offer_id || req.body.offerId || req.body.id;
        const coverLetter = req.body.cover_letter || req.body.coverLetter || req.body.motivation;
        
        if (!offerId || offerId === 'undefined') {
            return res.status(400).json({ error: "L'ID de l'offre est requis." });
        }

        // Vérifier si l'offre existe
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ error: "Offre introuvable." });
        }

        // Vérification du profil étudiant (CV et téléphone obligatoires)
        const student = req.user;
        if (!student.cv_url || !student.phone) {
            return res.status(400).json({ 
                error: "Désolé, vous devez compléter votre profil (CV et numéro de téléphone) avant de pouvoir postuler.",
                missingFields: {
                    cv_url: !student.cv_url,
                    phone: !student.phone
                }
            });
        }

        try {
            const newApplication = new Application({
                offer_id: offerId,
                student_id: req.user.id,
                cover_letter: coverLetter || null
            });
            
            await newApplication.save();
            res.status(201).json({ message: "Candidature envoyée avec succès.", applicationId: newApplication._id });
        } catch (dbError: any) {
            // Gérer l'index unique (déjà postulé)
            if (dbError.code === 11000) {
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
        const applications = await Application.find({ student_id: req.user.id })
            .populate({
                path: 'offer_id',
                populate: { path: 'companyId', select: 'name company_name' }
            })
            .sort({ createdAt: -1 });
        
        // Formater les données pour le front-end pour correspondre à l'ancienne structure SQLite
        const formatted = applications.map((app: any) => ({
            id: app._id,
            offer_id: app.offer_id?._id,
            offer_title: app.offer_id?.title,
            company_name: app.offer_id?.companyId?.company_name || app.offer_id?.companyId?.name,
            location: app.offer_id?.location,
            duration: app.offer_id?.duration,
            status: app.status,
            applied_at: app.createdAt
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
        let filter: any = {};

        if (req.user.role !== 'admin') {
            // On doit d'abord trouver les offres de cette entreprise
            const companyOffers = await Offer.find({ companyId: req.user.id }).select('_id');
            const offerIds = companyOffers.map(o => o._id);
            filter.offer_id = { $in: offerIds };
        }

        const applications = await Application.find(filter)
            .populate('student_id', 'name email sector company_name')
            .populate('offer_id', 'title')
            .sort({ createdAt: -1 });

        // Adapter au format attendu par le front (plat)
        const formatted = applications.map((app: any) => ({
            id: app._id,
            offer_id: app.offer_id?._id,
            status: app.status,
            applied_at: app.createdAt,
            name: app.student_id?.name,
            student_email: app.student_id?.email,
            speciality: app.student_id?.sector,
            university: app.student_id?.company_name, // Stocké dans company_name pour les étudiants parfois
            offer_title: app.offer_id?.title
        }));

        res.json(formatted);
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

        const appDetails = await Application.findById(id).populate('offer_id');

        if (!appDetails) {
            return res.status(404).json({ error: "Candidature introuvable." });
        }

        // Vérifier les droits
        const offer = appDetails.offer_id as any;
        if (req.user.role !== 'admin' && offer?.companyId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé. Cette candidature ne concerne pas vos offres." });
        }

        appDetails.status = status;
        await appDetails.save();
        
        res.json({ message: "Statut mis à jour avec succès.", status });
    } catch (error: any) {
        console.error("Update application status error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
