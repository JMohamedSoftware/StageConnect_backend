import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req: any, file, cb) => {
    // Nom du fichier : user_id_timestamp.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cv-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Uniquement les fichiers PDF sont autorisés !'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route d'upload du CV
router.post('/cv', authenticate, upload.single('cv'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
    }

    const cvUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user.id, { cv_url: cvUrl });

    res.json({ 
      message: 'CV téléchargé avec succès !', 
      cv_url: cvUrl 
    });
  } catch (error: any) {
    console.error('CV Upload error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload : ' + error.message });
  }
});

// Route pour récupérer les infos de l'étudiant (candidatures, etc. peut être ajouté ici aussi)
router.get('/profile', authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// Route pour mettre à jour le profil (téléphone, etc.)
router.patch('/profile', authenticate, async (req: any, res: any) => {
  try {
    const { phone } = req.body;
    await User.findByIdAndUpdate(req.user.id, { phone });
    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

export default router;
