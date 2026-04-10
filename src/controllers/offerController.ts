import Offer from '../models/Offer.js';

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

        const newOffer = new Offer({
            title, description,
            requirements: requirements || [],
            location, duration,
            domain: domain || 'General',
            contractType: contractType || 'Stage',
            deadline: deadline || undefined,
            benefits: benefits || [],
            workMode: workMode || 'Présentiel',
            salary, startDate, level, experience, languages,
            companyId: req.user.id
        });

        await newOffer.save();
        res.status(201).json({ message: "Offre créée avec succès", offer: newOffer });
    } catch (error: any) {
        console.error("Create offer error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getAllOffers = async (req: any, res: any) => {
    try {
        const { search, domain, city, duration, contractType } = req.query;
        const filter: Record<string, any> = {};

        if (search && typeof search === 'string' && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ title: regex }, { description: regex }];
        }
        if (domain && domain !== 'Domaine') filter.domain = domain;
        if (city && city !== 'Ville') filter.location = new RegExp(String(city), 'i');
        if (duration && duration !== 'Durée') filter.duration = duration;
        if (contractType && contractType !== 'Type de contrat') filter.contractType = contractType;

        const offers = await Offer.find(filter)
            .populate('companyId', 'name company_name email')
            .sort({ createdAt: -1 });

        res.json(offers);
    } catch (error: any) {
        console.error("Get offers error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getOfferById = async (req: any, res: any) => {
    try {
        const offer = await Offer.findById(req.params.id).populate('companyId', 'name company_name email phone website city');
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });
        res.json(offer);
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateOffer = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });

        if (req.user.role !== 'admin' && offer.companyId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        const updated = await Offer.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ message: "Offre mise à jour", offer: updated });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const deleteOffer = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ error: "Offre introuvable." });

        if (req.user.role !== 'admin' && offer.companyId.toString() !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        await Offer.findByIdAndDelete(id);
        res.json({ message: "Offre supprimée." });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
