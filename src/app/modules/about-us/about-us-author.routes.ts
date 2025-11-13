import express from 'express';
import { 
  createOrUpdateAboutUsAuthor, 
  getAllAboutUsAuthors, 
  getAboutUsAuthor
} from './about-us-author.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Admin routes (with authentication)
router.post('/', auth('admin'), upload.fields([{ name: 'image', maxCount: 1 }]), createOrUpdateAboutUsAuthor);
router.get('/admin/all', auth('admin'), getAllAboutUsAuthors);

// Frontend route (public)
router.get('/', getAboutUsAuthor);

export const aboutUsAuthorRouter = router;

