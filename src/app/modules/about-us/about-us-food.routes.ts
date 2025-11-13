import express from 'express';
import { 
  createOrUpdateAboutUsFood, 
  getAllAboutUsFoods, 
  getAboutUsFood
} from './about-us-food.controller';
import { upload } from '../../config/cloudinary';
import { auth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Admin routes (with authentication)
router.post('/', auth('admin'), upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'certLogos', maxCount: 10 }
]), createOrUpdateAboutUsFood);
router.get('/admin/all', auth('admin'), getAllAboutUsFoods);

// Frontend route (public)
router.get('/', getAboutUsFood);

export const aboutUsFoodRouter = router;

