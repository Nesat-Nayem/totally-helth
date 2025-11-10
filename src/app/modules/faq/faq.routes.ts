import express from 'express';
import { 
  createFAQ, 
  getAllFAQs, 
  getFAQById, 
  updateFAQById, 
  deleteFAQById,
  generateFAQAnswer
} from './faq.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new FAQ
router.post('/', auth(), createFAQ);

// Get all FAQs
router.get('/', getAllFAQs);

// Get a single FAQ by ID
router.get('/:id', getFAQById);

// Update a FAQ by ID
router.put('/:id', auth(), updateFAQById);

// Delete a FAQ by ID
router.delete('/:id', auth(), deleteFAQById);

// Generate FAQ answer using AI
router.post('/generate-answer', auth(), generateFAQAnswer);

export const faqRouter = router;