import express from 'express';
import { 
  createContact, 
  getAllContacts, 
  getContactById, 
  deleteContactById
} from './contact.controller';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Create a new contact enquiry (public route - no auth needed)
router.post('/', createContact);

// Get all contact enquiries (admin only)
router.get('/', getAllContacts);

// Get a single contact enquiry by ID (admin only)
router.get('/:id', getContactById);

// Delete a contact enquiry by ID (admin only)
router.delete('/:id', auth('admin'), deleteContactById);

export const contactRouter = router;

