import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMenuCategory, deleteMenuCategory, getMenuCategories, getMenuCategoryById, updateMenuCategory } from './menuCategory.controller';

const router = express.Router();

router.get('/', getMenuCategories);
router.get('/:id', getMenuCategoryById);
router.post('/', auth('admin'), createMenuCategory);
router.patch('/:id', auth('admin'), updateMenuCategory);
router.delete('/:id', auth('admin'), deleteMenuCategory);

export const menuCategoryRouter = router;
