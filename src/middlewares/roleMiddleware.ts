export const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: "Impossible de déterminer votre rôle." });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Accès refusé. Permission insuffisante." });
        }
        next();
    };
};

export const isCompanyOrAdmin = requireRole(['company', 'admin']);
export const isAdmin = requireRole(['admin']);
export const isStudent = requireRole(['student']);
