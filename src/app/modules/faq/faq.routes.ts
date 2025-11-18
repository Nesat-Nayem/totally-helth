import express from 'express';
import { 
  createFAQ, 
  getAllFAQs, 
  updateFAQById, 
  deleteFAQById
} from './faq.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new FAQ (Admin only)
router.post('/', auth(), createFAQ);

// Get all FAQs
// - Frontend: GET /faqs?active=true (returns only active FAQs)
// - Admin: GET /faqs (returns all FAQs)
router.get('/', getAllFAQs);

// Update a FAQ by ID (Admin only)
router.put('/:id', auth(), updateFAQById);

// Delete a FAQ by ID (Admin only)
router.delete('/:id', auth(), deleteFAQById);

export const faqRouter = router;