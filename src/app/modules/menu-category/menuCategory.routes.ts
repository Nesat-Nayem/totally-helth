import express from 'express';
import { auth } from '../../middlewares/authMiddleware';
import { createMenuCategory, deleteMenuCategory, getMenuCategories, getMenuCategoryById, updateMenuCategory } from './menuCategory.controller';

const router = express.Router();

router.get('/', auth(), getMenuCategories);
router.get('/:id', auth(), getMenuCategoryById);
router.post('/', auth(), createMenuCategory);
router.patch('/:id', auth(), updateMenuCategory);
router.delete('/:id', auth(), deleteMenuCategory);

export const menuCategoryRouter = router;
