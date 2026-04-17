import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'stageconnect-secret-key';

export const authenticate = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        // Fetch full user to check approval and other requirements
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: "Utilisateur non trouvé." });

        if (user.role === 'company' && !user.is_approved) {
            return res.status(403).json({ error: "Votre compte est en attente de validation ou a été bloqué." });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalide ou expiré." });
    }
};
