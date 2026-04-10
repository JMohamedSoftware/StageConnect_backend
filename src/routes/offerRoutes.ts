import express from 'express';
import { createOffer, getAllOffers, getOfferById, updateOffer, deleteOffer } from '../controllers/offerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isCompanyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllOffers);                                          // public
router.get('/:id', getOfferById);                                     // public
router.post('/', authenticate, isCompanyOrAdmin, createOffer);
router.put('/:id', authenticate, isCompanyOrAdmin, updateOffer);
router.delete('/:id', authenticate, isCompanyOrAdmin, deleteOffer);

export default router;
