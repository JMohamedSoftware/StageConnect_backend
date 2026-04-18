import express from 'express';
import { 
    applyToOffer, 
    getStudentApplications, 
    getCompanyApplications, 
    updateApplicationStatus 
} from '../controllers/applicationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isStudent, isCompanyOrAdmin } from '../middlewares/roleMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configuration Multer pour les candidatures
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req: any, file, cb) => {
    cb(null, `app-cv-${req.user.id}-${Date.now()}.pdf`);
  }
});
const upload = multer({ storage });

// L'étudiant postule à une offre
router.post('/', authenticate, isStudent, upload.single('cv'), applyToOffer);

// L'étudiant consulte ses candidatures
router.get('/student', authenticate, isStudent, getStudentApplications);

// L'entreprise (ou l'admin) consulte les candidatures reçues
router.get('/company', authenticate, isCompanyOrAdmin, getCompanyApplications);

// L'entreprise (ou l'admin) met à jour le statut d'une candidature
router.patch('/:id/status', authenticate, isCompanyOrAdmin, updateApplicationStatus);

export default router;
