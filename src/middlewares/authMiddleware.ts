import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'stageconnect-secret-key';

export const authenticate = (req: any, res: any, next: any) => {
    // Récupérer le token depuis l'en-tête Authorization (Bearer Token)
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role, ... }
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalide ou expiré." });
    }
};
