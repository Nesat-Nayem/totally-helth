import express from 'express';
import { 
  createOrUpdateAboutUsDetails, 
  getAllAboutUsDetails, 
  getAboutUsDetails
} from './about-us-details.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Admin routes (with authentication)
router.post('/', auth('admin'), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'icons', maxCount: 10 }
]), createOrUpdateAboutUsDetails);
router.get('/admin/all', auth('admin'), getAllAboutUsDetails);

// Frontend route (public)
router.get('/', getAboutUsDetails);

export const aboutUsDetailsRouter = router;

