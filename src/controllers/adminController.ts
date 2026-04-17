import User from '../models/User.js';
import Offer from '../models/Offer.js';
import Application from '../models/Application.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name, email,
            password: hashedPassword,
            role: role || 'student',
            company_name: role === 'company' ? (company_name || '') : undefined
        });

        await newUser.save();
        res.status(201).json({ message: "Utilisateur créé", userId: newUser._id });
    } catch (error: any) {
        console.error("Create user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateUser = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { name, email, role, company_name } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

        const updated = await User.findByIdAndUpdate(id, {
            name, email, role, company_name
        }, { new: true });

        res.json({ message: "Utilisateur mis à jour avec succès.", user: updated });
    } catch (error: any) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const deleteUser = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        
        // Supprimer l'utilisateur
        await User.findByIdAndDelete(id);
        
        // Optionnel: Supprimer les dépendances (offres de l'entreprise, candidatures de l'étudiant)
        // Pour l'instant on garde simple comme dans l'original
        
        res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error: any) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const toggleUserApproval = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { is_approved } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

        user.is_approved = is_approved;
        await user.save();

        res.json({ message: `Compte ${is_approved ? 'approuvé' : 'bloqué'} avec succès.`, user });
    } catch (error: any) {
        console.error("Toggle approval error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getPendingCompanies = async (req: any, res: any) => {
    try {
        const companies = await User.find({ role: 'company', is_approved: false }).sort({ createdAt: -1 });
        res.json(companies);
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const getPlatformStats = async (req: any, res: any) => {
    try {
        const [
            totalUsers, studentsCount, companiesCount, pendingCompaniesCount,
            totalOffers, activeOffersCount,
            totalApplications, pendingApplications, acceptedApplications, rejectedApplications
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'company' }),
            User.countDocuments({ role: 'company', is_approved: false }),
            Offer.countDocuments(),
            Offer.countDocuments({ status: 'active' }),
            Application.countDocuments(),
            Application.countDocuments({ status: 'pending' }),
            Application.countDocuments({ status: 'accepted' }),
            Application.countDocuments({ status: 'rejected' })
        ]);

        res.json({
            users: {
                total: totalUsers,
                students: studentsCount,
                companies: companiesCount,
                pending_companies: pendingCompaniesCount
            },
            offers: {
                total: totalOffers,
                active: activeOffersCount
            },
            applications: {
                total: totalApplications,
                pending: pendingApplications,
                accepted: acceptedApplications,
                rejected: rejectedApplications
            }
        });
    } catch (error: any) {
        console.error("Get platform stats error:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
