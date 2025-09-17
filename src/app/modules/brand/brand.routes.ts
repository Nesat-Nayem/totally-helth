import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from './brand.controller';

const router = express.Router();

router.get('/', getBrands);
router.get('/:id', getBrandById);
router.post('/', auth('admin'), createBrand);
router.patch('/:id', auth('admin'), updateBrand);
router.delete('/:id', auth('admin'), deleteBrand);

export const brandRouter = router;
