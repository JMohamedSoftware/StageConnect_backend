import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'stageconnect-secret-key';

export const register = async (req: any, res: any) => {
    try {
        const { name, email, password, role, company_name } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Champs requis manquants." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Cet email est déjà utilisé." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name, email,
            password: hashedPassword,
            role,
            company_name: role === 'company' ? (company_name || '') : undefined
        });

        await newUser.save();
        res.status(201).json({ message: "Inscription réussie !", userId: newUser._id });
    } catch (error: any) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Erreur lors de l'inscription: " + error.message });
    }
};

export const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Identifiants invalides." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Identifiants invalides." });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: "Connexion réussie !",
            token,
            user: {
                id: user._id,
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
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};

export const updateProfile = async (req: any, res: any) => {
    try {
        const allowedFields = ['company_name','sector','size','website','contact_email','phone','address','city','zip','country','name'];
        const updates: Record<string, any> = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "Aucun champ à mettre à jour." });
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json({ message: "Profil mis à jour.", user });
    } catch (error: any) {
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
};
