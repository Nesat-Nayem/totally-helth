import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from './brand.controller';

const router = express.Router();

router.get('/', auth(), getBrands);
router.get('/:id', auth(), getBrandById);
router.post('/', auth(), createBrand);
router.patch('/:id', auth(), updateBrand);
router.delete('/:id', auth(), deleteBrand);

export const brandRouter = router;
