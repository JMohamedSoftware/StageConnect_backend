import express from 'express';
import { 
    applyToOffer, 
    getStudentApplications, 
    getCompanyApplications, 
    updateApplicationStatus 
} from '../controllers/applicationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isStudent, isCompanyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// L'étudiant postule à une offre
router.post('/', authenticate, isStudent, applyToOffer);

// L'étudiant consulte ses candidatures
router.get('/student', authenticate, isStudent, getStudentApplications);

// L'entreprise (ou l'admin) consulte les candidatures reçues
router.get('/company', authenticate, isCompanyOrAdmin, getCompanyApplications);

// L'entreprise (ou l'admin) met à jour le statut d'une candidature
router.patch('/:id/status', authenticate, isCompanyOrAdmin, updateApplicationStatus);

export default router;
