import express from 'express';
import { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    getPlatformStats 
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Appliquer les middlewares pour toute la sous-route admin
router.use(authenticate, isAdmin);

// Routes Utilisateurs (CRUD)
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Route Statistiques (Stats)
router.get('/stats', getPlatformStats);

export default router;
